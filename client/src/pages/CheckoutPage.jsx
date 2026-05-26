// pages/CheckoutPage.js
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../Context/CartContext';
import { useAuth } from '../Context/AuthContext';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { FaArrowLeft, FaCheckCircle, FaTruck, FaShieldAlt, FaCreditCard, FaWhatsapp } from 'react-icons/fa';
import { getImageUrl, handleImageError } from '../utils/imageUtils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Helper function to get image URL

// Create axios instance without interceptors for guest checkout
const guestApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

const CheckoutPage = () => {
  const { cartItems, cartCount, cartTotal, clearCart } = useCart();
  const cart = {
    items: cartItems || [],
    totalItems: cartCount || 0,
    totalPrice: cartTotal || 0
  };
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState({
    shippingAddress: {
      fullName: user?.name || '',
      email: user?.email || '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    },
    paymentMethod: 'cod',
    notes: ''
  });

  const shippingCharge = cart.totalPrice >= 3000 ? 0 : 50;
  const finalTotal = cart.totalPrice + shippingCharge;

  useEffect(() => {
    if (cart.items.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
    }
  }, [cart.items.length, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setOrderData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setOrderData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    const { fullName, email, phone, address, city, state, zipCode, country } = orderData.shippingAddress;

    if (!fullName || !fullName.trim()) {
      toast.error('Please enter your full name');
      return false;
    }
    if (!email || !email.trim()) {
      toast.error('Please enter your email address');
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    if (!phone || !phone.trim()) {
      toast.error('Please enter your phone number');
      return false;
    }
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      toast.error('Please enter a valid phone number (minimum 10 digits)');
      return false;
    }
    if (!address || !address.trim()) {
      toast.error('Please enter your address');
      return false;
    }
    if (!city || !city.trim()) {
      toast.error('Please enter your city');
      return false;
    }
    if (!state || !state.trim()) {
      toast.error('Please enter your state');
      return false;
    }
    if (!zipCode || !zipCode.trim()) {
      toast.error('Please enter your ZIP code');
      return false;
    }
    if (!country || !country.trim()) {
      toast.error('Please enter your country');
      return false;
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      return;
    }

    if (cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);
    try {
      const orderItems = cart.items.map(item => {
        const basePrice = item.discountPrice && item.discountPrice > 0 ? item.discountPrice : item.price;
        return {
          product: item.product?._id || item.productId || item._id,
          name: item.product?.name || item.name,
          quantity: item.quantity,
          price: basePrice,
          originalPrice: basePrice,
          selectedColor: item.selectedColor,
          selectedColorName: item.selectedColorName,
          selectedColorCode: item.selectedColorCode,
          selectedColorPrice: item.selectedColorPrice,
          size: item.size,
          image: getImageUrl(item.product?.images?.[0]?.url || item.images?.[0]?.url || item.image)
        };
      });

      const orderPayload = {
        items: orderItems,
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod,
        notes: orderData.notes,
        shippingFee: shippingCharge,
        totalAmount: finalTotal
      };

      console.log('Sending order to:', `${API_URL}/orders`);
      console.log('Order payload:', orderPayload);

      // Build a concise WhatsApp order message client-side and open immediately
      const shopNumber = '9567161716'; // shop WhatsApp number (no country code prefix expected for wa.me)
      const itemsText = orderItems.map((it, i) => `${i + 1}. ${it.name} x${it.quantity} - ₹${(it.price * it.quantity).toFixed(0)}`).join('\n');
      const msg = `NEW ORDER REQUEST\n\nName: ${orderData.shippingAddress.fullName}\nPhone: ${orderData.shippingAddress.phone}\nEmail: ${orderData.shippingAddress.email}\nAddress: ${orderData.shippingAddress.address}, ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} - ${orderData.shippingAddress.zipCode}\n\nItems:\n${itemsText}\n\nShipping: ₹${shippingCharge.toFixed(0)}\nTotal: ₹${finalTotal.toFixed(0)}\nPayment: ${orderData.paymentMethod}\n\nNotes: ${orderData.notes || 'None'}\n\nPlease confirm by replying CONFIRM`;
      const whatsappUrlImmediate = `https://wa.me/${shopNumber}?text=${encodeURIComponent(msg)}`;

      // Open WhatsApp in a new tab immediately so user can send confirmation fast
      try {
        window.open(whatsappUrlImmediate, '_blank');
      } catch (e) {
        console.warn('Failed to open WhatsApp URL immediately', e);
      }

      // Send order in background; await response to update local state and show toasts
      const responsePromise = guestApi.post('/orders', orderPayload);

      try {
        const response = await responsePromise;
        console.log('Order response:', response.data);
        if (response.data.success) {
          const { orderId } = response.data.data;
          clearCart();
          localStorage.setItem('lastOrderId', orderId);
          toast.success('Order recorded. Please confirm on WhatsApp.');
        } else {
          toast.error('Order not recorded on server. Please try again.');
        }
      } catch (err) {
        console.error('Order error (background):', err);
        toast.error('Failed to record order on server. Please contact support.');
      }
    } catch (error) {
      console.error('Order error:', error);
      console.error('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to place order';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (cart.items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <Link to="/cart" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <FaArrowLeft className="mr-2" />
            Back to Cart
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Checkout
          </h1>
          <p className="text-center text-gray-600 mt-2">
            Complete your purchase - Order will be confirmed via WhatsApp
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {!user && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-blue-500 text-xl">🛍️</div>
                  <div className="flex-1">
                    <p className="text-blue-800 font-medium">Checking out as a guest?</p>
                    <p className="text-blue-600 text-sm mt-1">
                      Create an account to save your shipping information and track orders easily.
                    </p>
                    <Link
                      to="/register"
                      className="inline-block mt-2 text-blue-700 font-semibold text-sm hover:underline"
                    >
                      Create Account →
                    </Link>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FaWhatsapp className="text-green-500 text-2xl" />
                <div className="flex-1">
                  <p className="text-green-800 font-medium">Order Confirmation via WhatsApp</p>
                  <p className="text-green-700 text-sm mt-1">
                    After placing your order, you'll be redirected to WhatsApp to confirm your order.
                    Please send the pre-filled message to complete your order.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
                <h2 className="text-xl font-bold flex items-center">
                  <FaTruck className="mr-3 text-blue-500" />
                  Shipping Information
                </h2>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="shippingAddress.fullName"
                      value={orderData.shippingAddress.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      name="shippingAddress.email"
                      value={orderData.shippingAddress.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      name="shippingAddress.phone"
                      value={orderData.shippingAddress.phone}
                      onChange={handleInputChange}
                      placeholder="9876543210"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                    <input
                      type="text"
                      name="shippingAddress.address"
                      value={orderData.shippingAddress.address}
                      onChange={handleInputChange}
                      placeholder="House No, Street, Area"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      name="shippingAddress.city"
                      value={orderData.shippingAddress.city}
                      onChange={handleInputChange}
                      placeholder="Mumbai"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                    <input
                      type="text"
                      name="shippingAddress.state"
                      value={orderData.shippingAddress.state}
                      onChange={handleInputChange}
                      placeholder="Maharashtra"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
                    <input
                      type="text"
                      name="shippingAddress.zipCode"
                      value={orderData.shippingAddress.zipCode}
                      onChange={handleInputChange}
                      placeholder="400001"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                    <input
                      type="text"
                      name="shippingAddress.country"
                      value={orderData.shippingAddress.country}
                      onChange={handleInputChange}
                      placeholder="India"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
                <h2 className="text-xl font-bold flex items-center">
                  <FaCreditCard className="mr-3 text-blue-500" />
                  Payment Method
                </h2>
              </div>

              <div className="p-6">
                <div className="space-y-3">
                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition hover:border-blue-400 bg-green-50 border-green-300">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={orderData.paymentMethod === 'cod'}
                      onChange={handleInputChange}
                      className="mr-3 w-4 h-4 text-green-600"
                    />
                    <div className="flex-1">
                      <span className="font-semibold">Cash on Delivery</span>
                      <p className="text-sm text-gray-500">Pay when you receive the product</p>
                    </div>
                    <span className="text-green-600 text-sm">✓ No extra fee</span>
                  </label>

                  <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-700">
                    <p className="font-semibold">📱 WhatsApp Order Confirmation</p>
                    <p className="text-xs mt-1">After placing order, you'll need to confirm via WhatsApp. The order will be processed after confirmation.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Order Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={orderData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Special instructions for delivery, preferred delivery time, etc..."
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
                  <h2 className="text-xl font-bold">Order Summary</h2>
                </div>

                <div className="p-6">
                  <div className="space-y-3 max-h-80 overflow-y-auto mb-4">
                    {cart.items.map((item, idx) => {
                      const unitPrice = (item.discountPrice && item.discountPrice > 0 ? item.discountPrice : item.price) + (item.selectedColorPrice || 0);
                      const itemTotal = unitPrice * item.quantity;
                      
                      return (
                        <div key={idx} className="flex gap-3 pb-3 border-b border-gray-100">
                          <img
                            src={getImageUrl(item.image || (item.images && item.images.length > 0 ? item.images[0] : null))}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={handleImageError}
                          />
                          <div className="flex-1">
                            <h3 className="font-medium text-sm line-clamp-2">{item.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                              {item.selectedColor && (
                                <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                                  {item.selectedColor}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col mt-1">
                              <p className="text-sm font-semibold text-blue-600">
                                ₹{itemTotal.toFixed(2)}
                              </p>
                              {item.discountPrice > 0 && (
                                <p className="text-[10px] text-gray-400 line-through">
                                  ₹{((item.price + (item.selectedColorPrice || 0)) * item.quantity).toFixed(2)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">₹{cart.totalPrice?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      {shippingCharge === 0 ? (
                        <span className="text-green-600 font-medium">FREE</span>
                      ) : (
                        <span className="font-medium text-gray-800">₹{shippingCharge.toFixed(2)}</span>
                      )}
                    </div>
                    {shippingCharge > 0 && cart.totalPrice > 0 && (
                      <div className="text-xs text-blue-600 mt-1">
                        Add ₹{(3000 - cart.totalPrice).toFixed(2)} more to get free shipping!
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total Payable</span>
                        <span className="text-blue-600">₹{finalTotal?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="w-full mt-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <>
                        <FaWhatsapp className="text-xl" />
                        <span>Place Order & Confirm on WhatsApp</span>
                      </>
                    )}
                  </button>

                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                    <FaShieldAlt className="text-green-500" />
                    <span>Secure Checkout</span>
                    <span className="mx-1">•</span>
                    <FaCheckCircle className="text-green-500" />
                    <span>100% Purchase Protection</span>
                  </div>

                  <p className="text-xs text-gray-400 text-center mt-4">
                    By placing this order, you agree to our Terms & Conditions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;