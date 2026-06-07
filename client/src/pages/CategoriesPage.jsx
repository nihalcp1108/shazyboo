import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { FaSearch, FaStar, FaHeart, FaMagic, FaArrowRight, FaSpinner } from 'react-icons/fa';
import { getImageUrl, handleImageError, getFallbackImage } from '../utils/imageUtils';

const CategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [featuredCategories, setFeaturedCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewType, setViewType] = useState('grid');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const categoriesRes = await api.get('/categories');
            const featuredRes = await api.get('/categories/featured');
            
            setCategories(categoriesRes.data.data || []);
            setFeaturedCategories(featuredRes.data.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            // Fallback to dummy data if API fails
            setCategories([
                { _id: '1', name: 'New Arrivals', slug: 'new-arrivals', productCount: 12, description: 'Latest products', icon: '🎁', image: null },
                { _id: '2', name: 'Best Sellers', slug: 'best-sellers', productCount: 45, description: 'Most popular items', icon: '🔥', image: null },
                { _id: '3', name: 'On Sale', slug: 'on-sale', productCount: 28, description: 'Special discounts', icon: '💸', image: null },
                { _id: '4', name: 'Featured', slug: 'featured', productCount: 36, description: 'Curated collection', icon: '⭐', image: null }
            ]);
            setFeaturedCategories([
                { _id: '1', name: 'New Arrivals', slug: 'new-arrivals', productCount: 12, description: 'Latest products', icon: '🎁', image: null },
                { _id: '4', name: 'Featured', slug: 'featured', productCount: 36, description: 'Curated collection', icon: '⭐', image: null }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const filteredCategories = categories.filter(category =>
        category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 pt-20">
                <div className="container mx-auto px-4 py-12">
                    <div className="text-center mb-12">
                        <div className="h-8 bg-gradient-to-r from-pink-200 to-purple-200 rounded-full w-64 mx-auto mb-4 animate-pulse"></div>
                        <div className="h-4 bg-gradient-to-r from-pink-200 to-purple-200 rounded-full w-96 mx-auto mb-2 animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                                <div className="h-48 bg-gradient-to-r from-pink-100 to-purple-100"></div>
                                <div className="p-6 space-y-3">
                                    <div className="h-6 bg-gradient-to-r from-pink-100 to-purple-100 rounded"></div>
                                    <div className="h-4 bg-gradient-to-r from-pink-100 to-purple-100 rounded w-2/3"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 pt-20">
            {/* Featured Categories */}
            {featuredCategories.length > 0 && (
                <section className="py-12">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Categories</h2>
                            <p className="text-gray-600">Popular categories loved by our customers</p>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                            {featuredCategories.map((category) => {
                                const imageUrl = getImageUrl(category.image);
                                return (
                                    <Link
                                        key={category._id}
                                        to={`/categories/${category.slug}`}
                                        className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                                    >
                                        <div className="relative h-48 overflow-hidden">
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={category.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    onError={(e) => {
                                                        handleImageError(e);
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                                                    <span className="text-6xl">{category.icon || '📦'}</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        </div>
                                        <div className="p-5">
                                            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center group-hover:text-pink-600 transition-colors">
                                                {category.name}
                                            </h3>
                                            <p className="text-gray-600 text-center mb-3">
                                                {category.productCount || 0} products
                                            </p>
                                            <div className="flex items-center justify-center text-pink-500 group-hover:text-pink-600">
                                                <span className="text-sm font-medium">View Products</span>
                                                <FaArrowRight className="ml-2 text-sm group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* All Categories */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">All Categories</h2>
                        <p className="text-gray-600">Browse all our product categories</p>
                    </div>
                    
                    {filteredCategories.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-xl shadow-lg">
                            <div className="text-6xl mb-4">🔍</div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3">No Categories Found</h3>
                            <p className="text-gray-600 mb-6">Try a different search term</p>
                            <button
                                onClick={() => setSearchTerm('')}
                                className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-2 rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all"
                            >
                                View All Categories
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
                            {filteredCategories.map((category) => {
                                const imageUrl = getImageUrl(category.image);
                                return (
                                    <Link
                                        key={category._id}
                                        to={`/categories/${category.slug}`}
                                        className="group bg-gradient-to-br from-white to-pink-50 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                                    >
                                        <div className="relative h-40 overflow-hidden">
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={category.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    onError={(e) => {
                                                        handleImageError(e);
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                                                    <span className="text-5xl">{category.icon || '📦'}</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        </div>
                                        <div className="p-5">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-pink-600 transition-colors">
                                                    {category.name}
                                                </h3>
                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                                    {category.productCount || 0}
                                                </span>
                                            </div>
                                            {category.description && (
                                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                    {category.description}
                                                </p>
                                            )}
                                            <div className="flex items-center text-pink-500 group-hover:text-pink-600">
                                                <span className="text-sm font-medium">Shop Now</span>
                                                <FaArrowRight className="ml-2 text-xs group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-3xl p-10 text-white text-center">
                        <div className="max-w-2xl mx-auto">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Can't Find What You Need?</h2>
                            <p className="text-xl mb-6 text-white/90">Contact us for custom requests or bulk orders</p>
                            <Link
                                to="/contact"
                                className="inline-block bg-white text-pink-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-bold transition-all hover:shadow-lg"
                            >
                                Contact Us
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CategoriesPage;