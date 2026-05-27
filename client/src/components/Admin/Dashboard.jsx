import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaUsers, FaBox, FaShoppingCart, FaRupeeSign, FaExclamationTriangle, FaStar, FaFire, FaTag } from 'react-icons/fa';
import { getFallbackImage } from '../../utils/imageUtils.js';
import { api } from '../../services/api'
import siteLogo from '../../assets/Generated_Image_May_27__2026_-_11_13AM-removebg-preview.png';

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    // Get base URL function (same as ProductManager)
    const getBaseUrl = () => {
        const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5001/api';
        return API_URL.replace('/api', '');
    };

    // Image URL helper function (same as ProductManager)
    const getImageUrl = (image) => {
        if (!image || !image.url) {
            return getFallbackImage();
        }
        
        const BASE_URL = getBaseUrl();
        
        // If it's already a full URL
        if (image.url.startsWith('http://') || image.url.startsWith('https://')) {
            return image.url;
        }
        
        // If it's a Cloudinary URL
        if (image.public_id && image.url && image.url.includes('cloudinary')) {
            return image.url;
        }
        
        // If it's a base64 encoded image
        if (image.url.startsWith('data:')) {
            return image.url;
        }
        
        // For local uploads - construct the full URL (same logic as ProductManager)
        if (image.url) {
            // Remove any leading slash if present
            const imagePath = image.url.startsWith('/') ? image.url.substring(1) : image.url;
            return `${BASE_URL}/${imagePath}`;
        }
        
        // If we have a public_id but no URL
        if (image.public_id) {
            return `${BASE_URL}/uploads/products/${image.public_id}`;
        }
        
        // Fallback to cute placeholder
        return getFallbackImage();
    };

    const fetchDashboardData = async () => {
        try {
            const response = await api.get('/admin/dashboard')
            setDashboardData(response.data.data)
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="card animate-pulse p-6">
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const stats = [
        {
            title: 'Total Users',
            value: dashboardData?.counts?.totalUsers || 0,
            icon: <FaUsers className="text-blue-500" />,
            change: `+${dashboardData?.counts?.newUsersToday || 0} today`,
            color: 'blue',
            bgColor: 'from-blue-500 to-blue-600'
        },
        {
            title: 'Total Products',
            value: dashboardData?.counts?.totalProducts || 0,
            icon: <FaBox className="text-green-500" />,
            change: `${dashboardData?.counts?.outOfStockProducts || 0} out of stock`,
            color: 'green',
            bgColor: 'from-green-500 to-green-600'
        },
        {
            title: 'Pending Orders',
            value: dashboardData?.counts?.pendingOrders || 0,
            icon: <FaShoppingCart className="text-yellow-500" />,
            change: `${dashboardData?.counts?.newOrdersToday || 0} new today`,
            color: 'yellow',
            bgColor: 'from-yellow-500 to-yellow-600'
        },
        {
            title: 'Blocked Users',
            value: dashboardData?.counts?.blockedUsers || 0,
            icon: <FaExclamationTriangle className="text-red-500" />,
            change: 'Requires attention',
            color: 'red',
            bgColor: 'from-red-500 to-red-600'
        },
        {
            title: 'Total Revenue',
            value: `₹${dashboardData?.counts?.totalRevenue?.toLocaleString() || 0}`,
            icon: <FaRupeeSign className="text-purple-500" />,
            change: `₹${dashboardData?.counts?.monthlyRevenue?.toLocaleString() || 0} this month`,
            color: 'purple',
            bgColor: 'from-purple-500 to-purple-600'
        }
    ]

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-5 rounded-3xl shadow-sm border border-gray-200">
                <motion.img
                    src={siteLogo}
                    alt="ShazyBoo Admin Home"
                    className="h-16 w-auto object-contain"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: [0.95, 1.02, 0.98] }}
                    transition={{ duration: 2.2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                />
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Welcome back, ShazyBoo Admin</h1>
                    <p className="mt-2 text-sm text-slate-500">Your orders, products and revenue are ready for review.</p>
                </div>
            </div>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className={`bg-gradient-to-r ${stat.bgColor} text-white rounded-lg p-6 hover:shadow-xl transition-shadow`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-lg bg-white bg-opacity-20">
                                {stat.icon}
                            </div>
                            <span className="text-sm font-medium opacity-90">
                                {stat.change}
                            </span>
                        </div>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <div className="text-sm opacity-90 mt-1">{stat.title}</div>
                    </div>
                ))}
            </div>

            {/* Recent Data Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="card">
                    <div className="p-6 border-b">
                        <h2 className="text-lg font-semibold flex items-center justify-between">
                            <span>Recent Orders</span>
                            <a href="/admin/orders" className="text-sm text-lavender-600 hover:text-lavender-800">
                                View All →
                            </a>
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {dashboardData?.recentOrders?.slice(0, 5).map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {order.orderId}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                {order.user?.avatar ? (
                                                    <img 
                                                        src={getImageUrl({ url: order.user.avatar })} 
                                                        alt={order.user.name} 
                                                        className="w-8 h-8 rounded-full mr-3" 
                                                        onError={(e) => {
                                                            e.target.src = getFallbackImage();
                                                            e.target.onerror = null;
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 bg-lavender-100 rounded-full flex items-center justify-center text-lavender-600 mr-3">
                                                        {order.user?.name?.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{order.user?.name}</div>
                                                    <div className="text-xs text-gray-500">{order.user?.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            ₹{order.priceSummary?.totalPrice?.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                                                order.orderStatus === 'processing' ? 'bg-blue-100 text-blue-800' :
                                                order.orderStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {order.orderStatus}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Products */}
                <div className="card">
                    <div className="p-6 border-b">
                        <h2 className="text-lg font-semibold flex items-center justify-between">
                            <span>Top Products</span>
                            <a href="/admin/products" className="text-sm text-lavender-600 hover:text-lavender-800">
                                View All →
                            </a>
                        </h2>
                    </div>
                    <div className="overflow-y-auto max-h-96">
                        {dashboardData?.topProducts?.map((product) => (
                            <div key={product._id} className="flex items-center p-4 border-b hover:bg-gray-50">
                                <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                                    <img
                                        src={getImageUrl(product.images?.[0])}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = getFallbackImage();
                                            e.target.onerror = null;
                                        }}
                                    />
                                </div>
                                <div className="ml-4 flex-grow">
                                    <div className="font-medium text-sm">{product.name}</div>
                                    <div className="text-xs text-gray-500">{product.category}</div>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <div className="text-xs text-gray-500">Sold: {product.sold || 0}</div>
                                        <div className="flex items-center">
                                            <FaStar className="w-3 h-3 text-yellow-400" />
                                            <span className="text-xs ml-1">{product.ratings?.average?.toFixed(1)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold">₹{product.price}</div>
                                    <div className="text-xs text-gray-500">
                                        {product.stock > 10 ? (
                                            <span className="text-green-600">{product.stock} in stock</span>
                                        ) : product.stock > 0 ? (
                                            <span className="text-yellow-600">Low stock</span>
                                        ) : (
                                            <span className="text-red-600">Out of stock</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Trending & New Arrivals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trending Products */}
                <div className="card">
                    <div className="p-6 border-b">
                        <h2 className="text-lg font-semibold flex items-center">
                            <FaFire className="text-orange-500 mr-2" />
                            <span>Trending Products</span>
                        </h2>
                    </div>
                    <div className="overflow-y-auto max-h-96">
                        {dashboardData?.trendingProducts?.length > 0 ? (
                            dashboardData.trendingProducts.map((product) => (
                                <div key={product._id} className="flex items-center p-4 border-b hover:bg-gray-50">
                                    <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                                        <img
                                            src={getImageUrl(product.images?.[0])}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.src = getFallbackImage();
                                                e.target.onerror = null;
                                            }}
                                        />
                                    </div>
                                    <div className="ml-4 flex-grow">
                                        <div className="font-medium text-sm">{product.name}</div>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <div className="text-xs text-gray-500">Sold: {product.sold || 0}</div>
                                            <div className="flex items-center">
                                                <FaStar className="w-3 h-3 text-yellow-400" />
                                                <span className="text-xs ml-1">{product.ratings?.average?.toFixed(1)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold">₹{product.price}</div>
                                        <div className="text-xs text-gray-500">
                                            <FaFire className="inline w-3 h-3 text-orange-500" />
                                            <span className="ml-1">Trending</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                No trending products
                            </div>
                        )}
                    </div>
                </div>

                {/* New Arrivals */}
                <div className="card">
                    <div className="p-6 border-b">
                        <h2 className="text-lg font-semibold flex items-center">
                            <FaTag className="text-blue-500 mr-2" />
                            <span>New Arrivals</span>
                        </h2>
                    </div>
                    <div className="overflow-y-auto max-h-96">
                        {dashboardData?.newArrivalProducts?.length > 0 ? (
                            dashboardData.newArrivalProducts.map((product) => (
                                <div key={product._id} className="flex items-center p-4 border-b hover:bg-gray-50">
                                    <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                                        <img
                                            src={getImageUrl(product.images?.[0])}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.src = getFallbackImage();
                                                e.target.onerror = null;
                                            }}
                                        />
                                    </div>
                                    <div className="ml-4 flex-grow">
                                        <div className="font-medium text-sm">{product.name}</div>
                                        <div className="text-xs text-gray-500">
                                            Added: {new Date(product.createdAt).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <div className="text-xs text-gray-500">Sold: {product.sold || 0}</div>
                                            <div className="flex items-center">
                                                <FaStar className="w-3 h-3 text-yellow-400" />
                                                <span className="text-xs ml-1">{product.ratings?.average?.toFixed(1)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold">₹{product.price}</div>
                                        <div className="text-xs text-gray-500">
                                            <FaTag className="inline w-3 h-3 text-blue-500" />
                                            <span className="ml-1">New</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                No new arrivals
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Users */}
            <div className="card">
                <div className="p-6 border-b">
                    <h2 className="text-lg font-semibold flex items-center justify-between">
                        <span>Recent Users</span>
                        <a href="/admin/users" className="text-sm text-lavender-600 hover:text-lavender-800">
                            View All →
                        </a>
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {dashboardData?.recentUsers?.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            {user.avatar ? (
                                                <img 
                                                    src={getImageUrl({ url: user.avatar })}
                                                    alt={user.name}
                                                    className="w-8 h-8 rounded-full mr-3"
                                                    onError={(e) => {
                                                        e.target.src = getFallbackImage();
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-8 h-8 bg-lavender-100 rounded-full flex items-center justify-center text-lavender-600 font-semibold">
                                                    {user.name?.charAt(0)}
                                                </div>
                                            )}
                                            <div className="ml-3">
                                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                user.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {user.isVerified ? 'Verified' : 'Pending'}
                                            </span>
                                            {user.isBlocked && (
                                                <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                                                    Blocked
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Dashboard