// components/layout/Header.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { useCart } from "../../Context/CartContext";
import {
  FaSearch,
  FaUser,
  FaShoppingCart,
  FaBars,
  FaTimes,
  FaHeart,
  FaCrown,
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import siteLogo from '../../assets/logo.png';

// ── Logo ─────────────────────────────────────────────────────────────────────
const Logo = () => (
  <Link to="/" className="flex items-center group flex-shrink-0 z-10 px-2 sm:px-4 py-1">
    <div className="relative flex items-center justify-center">
      <motion.img
        src={siteLogo}
        alt="ShazyBoo"
        className="logo-image h-32 w-auto object-contain transition-transform duration-300 group-hover:scale-110"
        style={{ backgroundColor: 'transparent', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.05))' }}
        initial={{ scale: 0.96, opacity: 0.92 }}
        animate={{ scale: [0.96, 1.06, 0.96], opacity: [0.92, 1, 0.92] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        whileHover={{ scale: 1.12 }}
      />
    </div>
  </Link>
);

// ── Nav Link ───────────────────────────────────────
const NavLink = ({ to, label }) => {
  const { pathname } = useLocation();
  const isActive = pathname === to || (to !== "/" && pathname.startsWith(to));

  return (
    <Link
      to={to}
      className="relative px-4 py-2 text-sm font-bold rounded-full transition-colors duration-200 group"
      style={{
        color: isActive ? "#ffffff" : "#2e2c2c",
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      {/* Active / hover pill */}
      <span
        className={`absolute inset-0 rounded-full transition-opacity duration-200 ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        style={{ background: "linear-gradient(135deg, #f9a5b7, #cebaf8)" }}
        aria-hidden
      />
      <span className="relative z-10">{label}</span>
    </Link>
  );
};

// ── Shared icon-button style ─────────────────────────────────────────────────
const iconBtnStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 40,
  height: 40,
  borderRadius: "50%",
  background: "rgba(244, 196, 222, 0.9)",
  border: "2px solid #f8f4fe",
  cursor: "pointer",
  transition: "all 0.2s",
  position: "relative",
  flexShrink: 0,
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  textDecoration: "none",
};

// ── Header ───────────────────────────────────────────────────────────────────
const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  // Close mobile menu on route change
  const { pathname } = useLocation();
  useEffect(() => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsSearchOpen(false);
      setIsMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate("/");
  };

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/shop", label: "Shop" },
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" },
  ];

  const dropdownItems = [
    { to: "/profile", icon: <FaUserCircle />, label: "My Profile" },
    { to: "/my-orders", icon: <FaShoppingCart />, label: "My Orders" },
    { to: "/wishlist", icon: <FaHeart />, label: "Wishlist" },
  ];

  // Mobile menu item variants for staggered animation
  const mobileItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: "easeOut",
      },
    }),
    exit: {
      opacity: 0,
      x: -20,
      transition: { duration: 0.2 },
    },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap');

        .icon-btn:hover {
          border-color: #f88ecc !important;
          box-shadow: 0 4px 16px rgba(155,107,255,0.18) !important;
          transform: translateY(-1px);
        }

        @keyframes badgePop {
          0%   { transform: scale(0) rotate(-10deg); }
          70%  { transform: scale(1.15) rotate(4deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        .badge-pop { animation: badgePop 0.35s cubic-bezier(.34,1.56,.64,1) forwards; }

        /* Scrollbar hide for mobile menu */
        .mobile-menu::-webkit-scrollbar { display: none; }
        .mobile-menu {
          -ms-overflow-style: none;
          scrollbar-width: none;
          max-height: calc(100vh - 70px);
          overflow-y: auto;
        }

        /* Logo responsive styles */
        .logo-image {
          height: 5.0rem !important;
          transition: all 0.3s ease;
          filter: drop-shadow(0 2px 8px rgba(255, 107, 138, 0.15));
        }
        @media (max-width: 640px) {
          .logo-image {
            height: 3.8rem !important;
          }
        }
        @media (min-width: 641px) and (max-width: 1024px) {
          .logo-image {
            height: 5.6rem !important;
          }
        }
        @media (min-width: 1025px) {
          .logo-image {
            height: 6.5rem !important;
          }
        }

        /* Mobile menu overlay animation */
        .mobile-menu-overlay {
          backdrop-filter: blur(4px);
        }
      `}</style>

      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 overflow-visible ${scrolled ? "py-1 shadow-lg" : "py-3 shadow-none"}`} style={{ background: "linear-gradient(135deg, #f585b9 0%, #f585b9 0%, #e4f1f6 100%)", backdropFilter: scrolled ? "blur(20px)" : "none", fontFamily: "'Nunito', sans-serif", height: scrolled ? "80px" : "108px" }}>
        <div className="container mx-auto px-6 md:px-8 max-w-7xl h-full">
          <div className="flex items-center justify-between gap-4 sm:gap-6 w-full h-full">
            {/* ── Logo with Image (Left Column) ── */}
            <Logo />

            {/* ── Desktop Nav (Center Column) ── */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navLinks.map((link) => (
                <NavLink key={link.path} to={link.path} label={link.label} />
              ))}
            </nav>

            {/* ── Right Controls ── */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search */}
              <AnimatePresence mode="wait">
                {isSearchOpen ? (
                  <motion.form
                    key="search-open"
                    initial={{ opacity: 0, width: 32, scale: 0.9 }}
                    animate={{ opacity: 1, width: window.innerWidth < 640 ? 140 : 220, scale: 1 }}
                    exit={{ opacity: 0, width: 32, scale: 0.9 }}
                    transition={{ duration: 0.25, ease: "circOut" }}
                    onSubmit={handleSearch}
                    className="relative flex items-center"
                  >
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products…"
                      autoFocus
                      className="w-full pl-4 pr-9 py-2 rounded-full text-sm font-semibold focus:outline-none"
                      style={{
                        background: "#f5f0ff",
                        border: "2px solid #d8c8ff",
                        color: "#333",
                        boxShadow: "0 2px 10px rgba(155,107,255,0.12)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery("");
                      }}
                      className="absolute right-2.5 text-gray-400 hover:text-pink-500 transition-colors"
                      aria-label="Close search"
                    >
                      <FaTimes size={12} />
                    </button>
                  </motion.form>
                ) : (
                  <motion.button
                    key="search-closed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setIsSearchOpen(true)}
                    className="icon-btn"
                    style={iconBtnStyle}
                    aria-label="Open search"
                  >
                    <FaSearch size={14} style={{ color: "#888" }} />
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Wishlist — visible on mobile */}
              <Link
                to="/wishlist"
                className="icon-btn"
                style={iconBtnStyle}
                aria-label="Wishlist"
              >
                <FaHeart size={14} style={{ color: "#FF6B8A" }} />
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className="icon-btn"
                style={iconBtnStyle}
                aria-label={`Cart (${cartCount} items)`}
              >
                <FaShoppingCart size={14} style={{ color: "#9B6BFF" }} />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="badge-pop absolute -top-1.5 -right-1.5 text-white text-[10px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-md pointer-events-none"
                      style={{
                        background: "linear-gradient(135deg, #f9a5b7, #cebaf8)",
                      }}
                    >
                      {cartCount > 99 ? "99+" : cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>

              {/* User account */}
              {user ? (
                <div className="relative hidden lg:block">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full transition-all duration-200 hover:shadow-md"
                    style={{
                      background: isDropdownOpen
                        ? "rgba(155,107,255,0.15)"
                        : "rgba(155,107,255,0.08)",
                      border: "2px solid #e0ccff",
                    }}
                    aria-haspopup="true"
                    aria-expanded={isDropdownOpen}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-black shadow-sm flex-shrink-0"
                      style={{
                        background: "linear-gradient(135deg, #f9a5b7, #cebaf8)",
                      }}
                    >
                      {user.name?.charAt(0).toUpperCase() ?? "?"}
                    </div>
                    <span
                      className="hidden lg:inline text-sm font-bold truncate max-w-[80px]"
                      style={{ color: "#555" }}
                    >
                      {user.name?.split(" ")[0]}
                    </span>
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <>
                        {/* Backdrop */}
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setIsDropdownOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="absolute right-0 mt-3 w-64 rounded-2xl shadow-2xl z-50"
                          style={{
                            background: "#fff",
                            border: "1.5px solid #ede0ff",
                            boxShadow:
                              "0 20px 60px rgba(155,107,255,0.18), 0 4px 16px rgba(0,0,0,0.06)",
                          }}
                        >
                          {/* User header */}
                          <div
                            className="px-5 py-4 border-b"
                            style={{
                              background:
                                "linear-gradient(135deg, #fff0f5, #f5f0ff)",
                              borderColor: "#ede0ff",
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-11 h-11 rounded-full flex items-center justify-center text-white font-black text-lg shadow-sm flex-shrink-0"
                                style={{
                                  background:
                                    "linear-gradient(135deg, #f9a5b7, #cebaf8)",
                                }}
                              >
                                {user.name?.charAt(0).toUpperCase() ?? "?"}
                              </div>
                              <div className="min-w-0">
                                <p className="font-black text-gray-800 text-sm truncate">
                                  {user.name}
                                </p>
                                <p className="text-xs text-gray-400 truncate">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Menu items with staggered animation */}
                          <div className="py-2">
                            {dropdownItems.map((item, idx) => (
                              <motion.div
                                key={item.to}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.03 }}
                              >
                                <Link
                                  to={item.to}
                                  className="flex items-center gap-3 px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-pink-600 hover:bg-pink-50 transition-colors"
                                  onClick={() => setIsDropdownOpen(false)}
                                >
                                  <span
                                    style={{ color: "#FF6B8A", fontSize: 14 }}
                                  >
                                    {item.icon}
                                  </span>
                                  {item.label}
                                </Link>
                              </motion.div>
                            ))}

                            {isAdmin && (
                              <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                              >
                                <Link
                                  to="/admin/dashboard"
                                  className="flex items-center gap-3 px-5 py-2.5 text-sm font-bold hover:bg-purple-50 transition-colors"
                                  style={{ color: "#9B6BFF" }}
                                  onClick={() => setIsDropdownOpen(false)}
                                >
                                  <FaCrown size={14} />
                                  Admin Panel
                                </Link>
                              </motion.div>
                            )}

                            <hr
                              className="my-2 mx-3"
                              style={{ borderColor: "#f0e8ff" }}
                            />

                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.15 }}
                            >
                              <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 w-full px-5 py-2.5 text-sm font-bold text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <FaSignOutAlt size={14} />
                                Logout
                              </button>
                            </motion.div>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden lg:flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-white text-xs sm:text-sm font-black shadow-md transition-all hover:scale-105 hover:shadow-lg active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, #f9a5b7, #cebaf8)",
                    boxShadow: "0 4px 16px rgba(155,107,255,0.3)",
                  }}
                >
                  <FaUser size={11} className="sm:text-xs" />
                  <span>Login</span>
                </Link>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden icon-btn"
                style={{
                  ...iconBtnStyle,
                  background: isMenuOpen
                    ? "rgba(255, 107, 138, 0.95)"
                    : "rgba(244, 196, 222, 0.95)",
                  borderColor: isMenuOpen ? "#f585b9" : "#f8f4fe",
                }}
                aria-label="Toggle menu"
                aria-expanded={isMenuOpen}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isMenuOpen ? (
                    <motion.span
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center justify-center"
                    >
                      <FaTimes size={16} style={{ color: "#ffffff" }} />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="open"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center justify-center"
                    >
                      <FaBars size={16} style={{ color: "#7a5bb8" }} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>

          {/* ── Mobile Menu with Smooth Dropdown ── */}
          <AnimatePresence>
            {isMenuOpen && (
              <>
                {/* Backdrop overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 bg-black/20 mobile-menu-overlay lg:hidden z-30"
                  onClick={() => setIsMenuOpen(false)}
                />

                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={{
                    height: { duration: 0.3, ease: "easeOut" },
                    opacity: { duration: 0.2 },
                    y: { duration: 0.25 }
                  }}
                  className="lg:hidden overflow-hidden mobile-menu absolute top-full left-4 right-4 z-40 rounded-2xl shadow-2xl border"
                  style={{
                    borderColor: "#fde8f0",
                    background: "linear-gradient(135deg, #fff9fc, #fff5ff)",
                  }}
                >
                  <div className="pt-4 pb-5 px-4">
                    {/* Mobile search with better styling */}
                    <motion.form
                      onSubmit={handleSearch}
                      className="relative mb-5 px-2"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 }}
                    >
                      <FaSearch
                        size={14}
                        className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: "#d0a0ff" }}
                      />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products..."
                        className="w-full pl-10 pr-12 py-3 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all"
                        style={{
                          background: "#ffffff",
                          border: "2px solid #f0d8ff",
                          color: "#333",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        }}
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-pink-400 transition-colors"
                        >
                          <FaTimes size={12} />
                        </button>
                      )}
                    </motion.form>

                    {/* Mobile nav links with staggered animation */}
                    <div className="space-y-1 px-2">
                      {navLinks.map((link, index) => {
                        const isActive =
                          pathname === link.path ||
                          (link.path !== "/" && pathname.startsWith(link.path));
                        return (
                          <motion.div
                            key={link.path}
                            custom={index}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={mobileItemVariants}
                          >
                            <Link
                              to={link.path}
                              className={`flex items-center px-4 py-3.5 rounded-xl text-base font-bold transition-all duration-200 ${isActive
                                ? "text-white shadow-md"
                                : "text-gray-600 hover:bg-white/60"
                                }`}
                              style={{
                                background: isActive
                                  ? "linear-gradient(135deg, #f9a5b7, #cebaf8)"
                                  : "transparent",
                              }}
                              onClick={() => setIsMenuOpen(false)}
                            >
                              {link.label}
                            </Link>
                          </motion.div>
                        );
                      })}

                      {/* Divider with gradient */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="pt-3 mt-3"
                      >
                        <div
                          className="border-t mb-3"
                          style={{ borderColor: "#f0d8ff" }}
                        />

                        {!user ? (
                          <div className="space-y-1">
                            <motion.div
                              custom={4}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              variants={mobileItemVariants}
                            >
                              <Link
                                to="/login"
                                className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-bold transition-all duration-200 hover:bg-white/60"
                                style={{ color: "#FF6B8A" }}
                                onClick={() => setIsMenuOpen(false)}
                              >
                                <FaUser size={16} />
                                Sign In
                              </Link>
                            </motion.div>
                            <motion.div
                              custom={5}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              variants={mobileItemVariants}
                            >
                              <Link
                                to="/register"
                                className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-bold transition-all duration-200 hover:bg-white/60"
                                style={{ color: "#9B6BFF" }}
                                onClick={() => setIsMenuOpen(false)}
                              >
                                <FaUserCircle size={16} />
                                Create Account
                              </Link>
                            </motion.div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {/* User info card in mobile menu */}
                            <motion.div
                              custom={4}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              variants={mobileItemVariants}
                              className="mb-3 p-3 rounded-xl"
                              style={{
                                background: "linear-gradient(135deg, #fff0f5, #f5f0ff)",
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-md shadow-sm"
                                  style={{
                                    background: "linear-gradient(135deg, #f9a5b7, #cebaf8)",
                                  }}
                                >
                                  {user.name?.charAt(0).toUpperCase() ?? "?"}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-800 text-sm">
                                    {user.name}
                                  </p>
                                  <p className="text-xs text-gray-400 truncate max-w-[180px]">
                                    {user.email}
                                  </p>
                                </div>
                              </div>
                            </motion.div>

                            <motion.div
                              custom={5}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              variants={mobileItemVariants}
                            >
                              <Link
                                to="/profile"
                                className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-bold transition-all duration-200 hover:bg-white/60"
                                style={{ color: "#555" }}
                                onClick={() => setIsMenuOpen(false)}
                              >
                                <FaUserCircle size={16} />
                                My Profile
                              </Link>
                            </motion.div>
                            <motion.div
                              custom={6}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              variants={mobileItemVariants}
                            >
                              <Link
                                to="/my-orders"
                                className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-bold transition-all duration-200 hover:bg-white/60"
                                style={{ color: "#555" }}
                                onClick={() => setIsMenuOpen(false)}
                              >
                                <FaShoppingCart size={16} />
                                My Orders
                              </Link>
                            </motion.div>
                            <motion.div
                              custom={7}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              variants={mobileItemVariants}
                            >
                              <Link
                                to="/wishlist"
                                className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-bold transition-all duration-200 hover:bg-white/60"
                                style={{ color: "#FF6B8A" }}
                                onClick={() => setIsMenuOpen(false)}
                              >
                                <FaHeart size={16} />
                                Wishlist
                              </Link>
                            </motion.div>

                            {isAdmin && (
                              <motion.div
                                custom={8}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                variants={mobileItemVariants}
                              >
                                <Link
                                  to="/admin/dashboard"
                                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-bold transition-all duration-200 hover:bg-white/60"
                                  style={{ color: "#9B6BFF" }}
                                  onClick={() => setIsMenuOpen(false)}
                                >
                                  <FaCrown size={16} />
                                  Admin Panel
                                </Link>
                              </motion.div>
                            )}

                            <motion.div
                              custom={9}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              variants={mobileItemVariants}
                            >
                              <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-base font-bold transition-all duration-200 hover:bg-red-50"
                                style={{ color: "#f87171" }}
                              >
                                <FaSignOutAlt size={16} />
                                Logout
                              </button>
                            </motion.div>
                          </div>
                        )}
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Spacer so content doesn't hide behind fixed header */}
      <div style={{ height: scrolled ? "68px" : "84px" }} aria-hidden />
    </>
  );
};

export default Header;