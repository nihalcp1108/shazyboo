import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import footerLogo from '../../assets/Generated_Image_May_27__2026_-_11_13AM-removebg-preview.png'

const Footer = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/main-categories/active');
        setCategories(response.data.data || []);
      } catch (error) {
        console.error('Error fetching footer categories:', error);
      } finally {
        setLoading(false);
      }
    };


    fetchCategories();
  }, []);

  return (
    <footer className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #fce7f3 0%, #fae8ff 100%)' }}>
      {/* Decorative Wave at Top */}
      <div className="absolute top-0 left-0 right-0" style={{ lineHeight: 0 }}>
        <svg viewBox="0 0 1440 40" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 40 }}>
          <path d="M0,0 C180,30 360,0 540,10 C720,20 900,0 1080,10 C1260,20 1350,0 1440,10 L1440,0 L0,0 Z"
            fill="var(--kiddex-bg)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 pt-16 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <Link to="/" className="flex items-center space-x-2 mb-6 group">
              <img src={footerLogo} alt="ShazyBoo" className="h-10 w-auto transition-transform group-hover:scale-110" />
            </Link>
            <p className="text-gray-600 font-bold mb-6 max-w-xs">
              Your one-stop destination for premium quality products. We deliver happiness right to your doorstep.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-sm bg-white text-pink-500">
                <FaFacebook size={16} />
              </a>
              <a href="https://www.instagram.com/shazy_boo_?igsh=MWlkbXdvYjlmYWZwMA==" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-sm bg-white text-pink-500">
                <FaInstagram size={16} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-sm bg-white text-pink-500">
                <FaLinkedin size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-left">
            <h3 className="fredoka text-xl text-gray-800 mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { to: "/", label: "Home" },
                { to: "/shop", label: "Shop" },
                { to: "/about", label: "About Us" },
                { to: "/contact", label: "Contact" },
                { to: "/privacy", label: "Privacy Policy" }
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-gray-600 font-bold hover:text-pink-600 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="text-center md:text-left">

            <h3 className="fredoka text-xl text-gray-800 mb-6">All Categories</h3>
            <ul className="space-y-3">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <li key={i} className="h-4 w-24 bg-pink-200/50 rounded animate-pulse"></li>
                ))
              ) : categories.length > 0 ? (
                categories.slice(0, 6).map((cat) => (
                  <li key={cat._id}>
                    <Link to={`/main-category/${cat.slug || cat._id}`} className="text-gray-600 font-bold hover:text-purple-600 transition-colors">
                      {cat.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-gray-500">No categories available.</li>
              )}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="text-center md:text-left">
            <h3 className="fredoka text-xl text-gray-800 mb-6">Stay in Touch</h3>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start justify-center md:justify-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                  <FaPhone size={12} className="text-blue-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-600 font-bold text-sm">+91 95671 61716</span>
                  <span className="text-gray-600 font-bold text-sm">+91 97780 34171</span>
                </div>
              </li>
              <li className="flex items-start justify-center md:justify-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                  <FaEnvelope size={12} className="text-pink-500" />
                </div>
                <span className="text-gray-600 font-bold text-sm">shazyboo.info@gmail.com</span>
              </li>
              <li className="flex items-start justify-center md:justify-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                  <FaMapMarkerAlt size={12} className="text-green-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-600 font-bold text-sm">Kakkad, Malappuram</span>
                  <span className="text-gray-600 font-bold text-sm">Kerala, 676306</span>
                </div>
              </li>
            </ul>
            
            <div className="relative group">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-5 py-3 rounded-full text-sm font-bold bg-white/60 border-2 border-white focus:outline-none focus:border-pink-300 transition-all shadow-sm"
              />
              <button className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-full flex items-center justify-center text-white transition-transform hover:scale-105 active:scale-95 shadow-md"
                style={{ background: 'linear-gradient(135deg, var(--kiddex-pink), var(--kiddex-orange))' }}>
                <FaPaperPlane size={12} />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/30 text-center">
          <p className="text-sm font-bold text-gray-500">
            &copy; {new Date().getFullYear()} ShazyBoo. Your happy little corner 🎀
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
