// pages/OrderConfirmation.js
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';
import { FaCheckCircle, FaTruck, FaCalendarAlt, FaMapMarkerAlt, FaBox, FaRupeeSign, FaPrint, FaHome } from 'react-icons/fa';

import { getImageUrl, handleImageError } from "../utils/imageUtils";

const OrderConfirmation = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data.data);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <FaCheckCircle className="text-green-500 text-4xl" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Order Confirmed! 🎉
          </h1>
          <p className="text-gray-600">
            Thank you for your purchase. Your order has been placed successfully.
          </p>
        </div>

        {/* Order Info Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <p className="text-sm text-gray-600">Order Number</p>
                <p className="text-xl font-bold text-blue-600">{order.orderId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Order Date</p>
                <p className="font-semibold flex items-center">
                  <FaCalendarAlt className="mr-2 text-gray-500" />
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Order Status</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
                  {order.orderStatus?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Items List */}
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-3 flex items-center">
                <FaBox className="mr-2 text-blue-500" />
                Items Ordered
              </h3>
              <div className="space-y-3">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex gap-4 pb-3 border-b border-gray-100">
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                      onError={(e) => {
                        handleImageError(e);
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      <p className="text-sm font-semibold text-blue-600">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-3 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-blue-500" />
                Shipping Address
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold">{order.shippingAddress?.fullName}</p>
                <p className="text-gray-600">{order.shippingAddress?.address}</p>
                <p className="text-gray-600">
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.zipCode}
                </p>
                <p className="text-gray-600">{order.shippingAddress?.country}</p>
                <p className="text-gray-600 mt-2">📞 {order.shippingAddress?.phone}</p>
                <p className="text-gray-600">✉️ {order.shippingAddress?.email}</p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-3">Order Summary</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{order.priceSummary?.itemsPrice?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-blue-600">₹{order.priceSummary?.totalPrice?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-3">Payment Method</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold">
                  {order.paymentInfo?.method === 'cod' ? 'Cash on Delivery' : order.paymentInfo?.method}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {order.paymentInfo?.method === 'cod' 
                    ? 'Pay when you receive the product' 
                    : 'Payment completed'}
                </p>
              </div>
            </div>

            {/* Delivery Estimate */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <div className="flex items-center">
                <FaTruck className="text-blue-500 text-2xl mr-3" />
                <div>
                  <p className="font-semibold text-blue-800">Estimated Delivery</p>
                  <p className="text-blue-600">
                    {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg transition"
              >
                <FaPrint />
                Print Order
              </button>
              <Link
                to="/shop"
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition"
              >
                <FaHome />
                Continue Shopping
              </Link>
            </div>

            {/* Guest User Message */}
            {!user && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm text-center">
                  📧 A confirmation email has been sent to {order.shippingAddress?.email}. 
                  <Link to="/register" className="ml-2 text-yellow-900 font-semibold underline">
                    Create an account
                  </Link>
                  {' '}to track your order history.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;