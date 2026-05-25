import { useState, useEffect } from 'react'
import { FaSearch, FaEye, FaTruck, FaCheck, FaTimes, FaPrint, FaDownload, FaWhatsapp } from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import { api } from '../../services/api';
import { getFallbackImage, handleImageError } from '../../utils/imageUtils';

const OrderManager = () => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [showOrderDetails, setShowOrderDetails] = useState(false)
    const [statusFilter, setStatusFilter] = useState('all')

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

    // Helper function for user avatars
    const getAvatarUrl = (avatar) => {
        if (!avatar) return null;
        if (typeof avatar === 'string') {
            return getImageUrl({ url: avatar });
        }
        return getImageUrl(avatar);
    };

    useEffect(() => {
        fetchOrders()
    }, [page, search, statusFilter])

    const fetchOrders = async () => {
        try {
            setLoading(true)
            const params = {
                page,
                limit: 10,
                ...(search && { search }),
                ...(statusFilter !== 'all' && { status: statusFilter })
            }
            const response = await api.get('/admin/orders', { params })
            setOrders(response.data.data)
            setTotalPages(response.data.pagination.pages)
        } catch (error) {
            toast.error('Failed to fetch orders')
        } finally {
            setLoading(false)
        }
    }

    const viewOrderDetails = async (orderId) => {
        try {
            const response = await api.get(`/admin/orders/${orderId}`)
            setSelectedOrder(response.data.data)
            setShowOrderDetails(true)
        } catch (error) {
            toast.error('Failed to fetch order details')
        }
    }

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const response = await api.put(`/admin/orders/${orderId}/status`, { status: newStatus })
            toast.success(`Order status updated to ${newStatus}`)
            
            // If there's a WhatsApp URL returned, offer to open it
            if (response.data.whatsappStatusUrl) {
                toast((t) => (
                    <span>
                        Status updated! 
                        <button 
                            onClick={() => {
                                window.open(response.data.whatsappStatusUrl, '_blank');
                                toast.dismiss(t.id);
                            }}
                            className="ml-4 bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition"
                        >
                            Notify on WhatsApp
                        </button>
                    </span>
                ), { duration: 6000 });
            }

            fetchOrders()
            if (selectedOrder && selectedOrder._id === orderId) {
                setSelectedOrder({...selectedOrder, orderStatus: newStatus})
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update order status')
        }
    }

    const updatePaymentStatus = async (orderId, newStatus) => {
        try {
            await api.put(`/admin/orders/${orderId}/status`, { paymentStatus: newStatus })
            toast.success(`Payment status updated to ${newStatus}`)
            fetchOrders()
            if (selectedOrder && selectedOrder._id === orderId) {
                setSelectedOrder({...selectedOrder, paymentInfo: {...selectedOrder.paymentInfo, status: newStatus}})
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update payment status')
        }
    }

    const updateTracking = async (orderId, trackingData) => {
        try {
            await api.put(`/admin/orders/${orderId}/tracking`, trackingData)
            toast.success('Tracking information updated')
            fetchOrders()
        } catch (error) {
            toast.error('Failed to update tracking information')
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800'
            case 'confirmed': return 'bg-blue-100 text-blue-800'
            case 'processing': return 'bg-purple-100 text-purple-800'
            case 'shipped': return 'bg-indigo-100 text-indigo-800'
            case 'delivered': return 'bg-green-100 text-green-800'
            case 'cancelled': return 'bg-red-100 text-red-800'
            case 'returned': return 'bg-gray-100 text-gray-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const statusOptions = [
        { value: 'all', label: 'All Orders' },
        { value: 'pending', label: 'Pending' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'processing', label: 'Processing' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' }
    ]

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Order Management</h2>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by Order ID, Customer Name, Email, or Phone..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender-500"
                        />
                    </div>
                    
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lavender-500"
                    >
                        {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lavender-600 mx-auto"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {order.orderId}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{order.user?.name || order.userDetails?.name}</div>
                                                <div className="text-xs text-gray-500">{order.user?.email || order.userDetails?.email}</div>
                                                <div className="text-xs text-gray-500">{order.user?.phone || order.userDetails?.phone || 'N/A'}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            ₹{order.priceSummary?.totalPrice?.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <div className="font-medium">{order.paymentInfo?.method}</div>
                                                <span className={`text-xs px-2 py-1 rounded-full ${
                                                    order.paymentInfo?.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    order.paymentInfo?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {order.paymentInfo?.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.orderStatus)}`}>
                                                {order.orderStatus}
                                            </span>
                                            {order.trackingInfo?.trackingNumber && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Track: {order.trackingInfo.trackingNumber}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => viewOrderDetails(order._id)}
                                                    className="text-blue-600 hover:text-blue-900 p-1"
                                                    title="View Details"
                                                >
                                                    <FaEye />
                                                </button>
                                                {order.orderStatus === 'confirmed' && (
                                                    <button
                                                        onClick={() => updateOrderStatus(order._id, 'processing')}
                                                        className="text-purple-600 hover:text-purple-900 p-1"
                                                        title="Mark as Processing"
                                                    >
                                                        Process
                                                    </button>
                                                )}
                                                {order.orderStatus === 'processing' && (
                                                    <button
                                                        onClick={() => updateOrderStatus(order._id, 'shipped')}
                                                        className="text-indigo-600 hover:text-indigo-900 p-1"
                                                        title="Mark as Shipped"
                                                    >
                                                        <FaTruck />
                                                    </button>
                                                )}
                                                {order.orderStatus === 'shipped' && (
                                                    <button
                                                        onClick={() => updateOrderStatus(order._id, 'delivered')}
                                                        className="text-green-600 hover:text-green-900 p-1"
                                                        title="Mark as Delivered"
                                                    >
                                                        <FaCheck />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2">
                    <button
                        onClick={() => setPage(prev => Math.max(1, prev - 1))}
                        disabled={page === 1}
                        className={`px-3 py-2 rounded ${
                            page === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        Previous
                    </button>
                    
                    {[...Array(totalPages)].map((_, i) => {
                        const pageNumber = i + 1
                        if (
                            pageNumber === 1 ||
                            pageNumber === totalPages ||
                            (pageNumber >= page - 1 && pageNumber <= page + 1)
                        ) {
                            return (
                                <button
                                    key={pageNumber}
                                    onClick={() => setPage(pageNumber)}
                                    className={`px-3 py-2 rounded ${
                                        page === pageNumber
                                            ? 'bg-lavender-600 text-white'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    {pageNumber}
                                </button>
                            )
                        }
                        return null
                    })}
                    
                    <button
                        onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={page === totalPages}
                        className={`px-3 py-2 rounded ${
                            page === totalPages
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Order Details Modal */}
            {showOrderDetails && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold">Order #{selectedOrder.orderId}</h3>
                                    <p className="text-sm text-gray-500">Placed on {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => window.print()}
                                        className="text-gray-600 hover:text-gray-900 p-2"
                                        title="Print Invoice"
                                    >
                                        <FaPrint />
                                    </button>
                                    <button
                                        onClick={() => setShowOrderDetails(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Order Status & Actions */}
                                <div className="bg-gray-50 p-4 rounded-lg flex flex-col md:flex-row gap-6">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-700 mb-2">Order Status</h4>
                                        <div className="flex flex-col gap-2">
                                            <select
                                                value={selectedOrder.orderStatus}
                                                onChange={(e) => updateOrderStatus(selectedOrder._id, e.target.value)}
                                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full max-w-xs bg-white"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="confirmed">Confirmed</option>
                                                <option value="processing">Processing</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                                <option value="refunded">Refunded</option>
                                            </select>
                                            
                                            {selectedOrder.trackingInfo?.trackingNumber && (
                                                <div className="mt-2 bg-white p-3 rounded border text-sm max-w-xs">
                                                    <p><span className="font-medium text-gray-600">Tracking:</span> {selectedOrder.trackingInfo.trackingNumber}</p>
                                                    <p><span className="font-medium text-gray-600">Carrier:</span> {selectedOrder.trackingInfo.carrier || 'N/A'}</p>
                                                </div>
                                            )}
                                            
                                            <button
                                                onClick={() => {
                                                    const trackingNumber = prompt('Enter tracking number:', selectedOrder.trackingInfo?.trackingNumber || '')
                                                    const carrier = prompt('Enter carrier name:', selectedOrder.trackingInfo?.carrier || '')
                                                    if (trackingNumber && carrier) {
                                                        updateTracking(selectedOrder._id, { trackingNumber, carrier })
                                                    }
                                                }}
                                                className="w-max mt-2 px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 text-sm font-medium transition-colors"
                                            >
                                                {selectedOrder.trackingInfo?.number ? 'Update Tracking' : '+ Add Tracking'}
                                            </button>

                                            {selectedOrder.shippingAddress?.phone && (
                                                <button
                                                    onClick={() => {
                                                        const statusMsg = `Hello ${selectedOrder.shippingAddress.fullName || 'Customer'},\n\nYour order #${selectedOrder.orderId} status is: *${(selectedOrder.orderStatus).toUpperCase()}*.\n\nThank you for shopping with ShazyBoo! 🎀`;
                                                        const url = `https://wa.me/${selectedOrder.shippingAddress.phone.replace(/\D/g, '')}?text=${encodeURIComponent(statusMsg)}`;
                                                        window.open(url, '_blank');
                                                    }}
                                                    className="w-max mt-2 px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 text-sm font-medium transition-colors flex items-center gap-2"
                                                >
                                                    <FaWhatsapp className="text-green-500" />
                                                    Notify on WhatsApp
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-700 mb-2">Payment Status</h4>
                                        <div className="flex flex-col gap-2">
                                            <select
                                                value={selectedOrder.paymentInfo?.status || 'pending'}
                                                onChange={(e) => updatePaymentStatus(selectedOrder._id, e.target.value)}
                                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full max-w-xs bg-white"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="completed">Completed</option>
                                                <option value="failed">Failed</option>
                                                <option value="refunded">Refunded</option>
                                            </select>
                                            
                                            <div className="mt-2 text-sm text-gray-600">
                                                <p><span className="font-medium">Method:</span> {selectedOrder.paymentInfo?.method || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Customer & Shipping Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-medium text-gray-700 mb-2">Customer Information</h4>
                                        <div className="space-y-1">
                                            <p><span className="font-medium">Name:</span> {selectedOrder.user?.name || selectedOrder.userDetails?.name}</p>
                                            <p><span className="font-medium">Email:</span> {selectedOrder.user?.email || selectedOrder.userDetails?.email}</p>
                                            <p><span className="font-medium">Phone:</span> {selectedOrder.user?.phone || selectedOrder.userDetails?.phone || 'N/A'}</p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-medium text-gray-700 mb-2">Shipping Address</h4>
                                        <div className="space-y-1">
                                            <p>{selectedOrder.shippingAddress?.name}</p>
                                            <p>{selectedOrder.shippingAddress?.street}</p>
                                            <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.zipCode}</p>
                                            <p>{selectedOrder.shippingAddress?.country}</p>
                                            <p>Phone: {selectedOrder.shippingAddress?.phone}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-2">Order Items</h4>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="p-3 text-left text-sm font-medium text-gray-700">Product</th>
                                                    <th className="p-3 text-left text-sm font-medium text-gray-700">Price</th>
                                                    <th className="p-3 text-left text-sm font-medium text-gray-700">Quantity</th>
                                                    <th className="p-3 text-left text-sm font-medium text-gray-700">Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedOrder.items?.map((item, index) => (
                                                    <tr key={index} className="border-b">
                                                        <td className="p-3">
                                                            <div className="flex items-center">
                                                                {item.product?.images?.[0] && (
                                                                    <img
                                                                        src={getImageUrl(item.product.images[0])}
                                                                        alt={item.product?.name}
                                                                        className="w-12 h-12 object-cover rounded mr-3"
                                                                        onError={(e) => {
                                                                            handleImageError(e);
                                                                            
                                                                        }}
                                                                    />
                                                                )}
                                                                <div>
                                                                    <div className="font-medium">{item.product?.name || item.productDetails?.name}</div>
                                                                    <div className="text-sm text-gray-500">{item.product?.sku || 'N/A'}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-3">₹{item.price?.toFixed(2)}</td>
                                                        <td className="p-3">{item.quantity}</td>
                                                        <td className="p-3 font-medium">₹{item.subtotal?.toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Price Summary */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-700 mb-3">Price Summary</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span>Items Price:</span>
                                            <span>₹{selectedOrder.priceSummary?.itemsPrice?.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Shipping:</span>
                                            <span>₹{selectedOrder.priceSummary?.shippingPrice?.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Tax:</span>
                                            <span>₹{selectedOrder.priceSummary?.taxPrice?.toFixed(2)}</span>
                                        </div>
                                        {selectedOrder.priceSummary?.discountPrice > 0 && (
                                            <div className="flex justify-between text-green-600">
                                                <span>Discount:</span>
                                                <span>-₹{selectedOrder.priceSummary?.discountPrice?.toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between border-t pt-2 font-bold text-lg">
                                            <span>Total:</span>
                                            <span>₹{selectedOrder.priceSummary?.totalPrice?.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Information */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-700 mb-2">Payment Information</h4>
                                    <div className="space-y-1">
                                        <p><span className="font-medium">Method:</span> {selectedOrder.paymentInfo?.method}</p>
                                        <p><span className="font-medium">Status:</span> {selectedOrder.paymentInfo?.status}</p>
                                        {selectedOrder.paymentInfo?.transactionId && (
                                            <p><span className="font-medium">Transaction ID:</span> {selectedOrder.paymentInfo.transactionId}</p>
                                        )}
                                        {selectedOrder.paymentInfo?.paymentDate && (
                                            <p><span className="font-medium">Payment Date:</span> {new Date(selectedOrder.paymentInfo.paymentDate).toLocaleString()}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Notes */}
                                {(selectedOrder.notes?.customerNote || selectedOrder.notes?.adminNote) && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-medium text-gray-700 mb-2">Notes</h4>
                                        {selectedOrder.notes?.customerNote && (
                                            <div className="mb-2">
                                                <span className="font-medium">Customer Note:</span>
                                                <p className="text-sm text-gray-600">{selectedOrder.notes.customerNote}</p>
                                            </div>
                                        )}
                                        {selectedOrder.notes?.adminNote && (
                                            <div>
                                                <span className="font-medium">Admin Note:</span>
                                                <p className="text-sm text-gray-600">{selectedOrder.notes.adminNote}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default OrderManager