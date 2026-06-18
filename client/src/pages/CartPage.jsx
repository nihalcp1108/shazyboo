// pages/CartPage.js
import { useCart } from "../Context/CartContext";
import CartItem from "../components/cart/CartItem";
import CartSummary from "../components/cart/CartSummery";
import { Link, useNavigate } from "react-router-dom";
import {
  FaHeart,
  FaGift,
  FaArrowRight,
  FaShoppingBag,
  FaMagic,
  FaShoppingCart,
} from "react-icons/fa";
import { useState } from "react";
import { toast } from "react-hot-toast";

const CartPage = () => {
  const { cartItems, cartCount, cartTotal, clearCart, getCartItemKey } = useCart();
  const cart = {
    items: cartItems || [],
    totalItems: cartCount || 0,
    totalPrice: cartTotal || 0,
    isGuest: !localStorage.getItem('token')
  };
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState("");

  const shippingCharge = cart.totalPrice >= 1999 ? 0 : 50;
  const finalTotal = cart.totalPrice + shippingCharge;

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    // Navigate directly to checkout - no login required
    navigate("/checkout");
  };

  const applyPromoCode = () => {
    if (!promoCode.trim()) {
      toast.error("Please enter a promo code");
      return;
    }

    // Simple promo code validation
    const validCodes = {
      "WELCOME10": 10,
      "FREESHIP": "free shipping",
      "SAVE20": 20
    };

    if (validCodes[promoCode.toUpperCase()]) {
      const discount = validCodes[promoCode.toUpperCase()];
      toast.success(`Promo code applied! ${typeof discount === 'number' ? `${discount}% off` : 'Free shipping!'}`);
    } else {
      toast.error("Invalid promo code");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-6 py-3 mb-4 shadow-lg">
            <FaShoppingBag className="text-blue-500 mr-3 text-xl" />
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Your Shopping Cart
            </h1>
          </div>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            {cart.items.length === 0
              ? "Your cart is empty. Start shopping now!"
              : `${cart.totalItems} items in your cart`}
          </p>
        </div>

        {/* Guest Checkout Notice */}
        {cart.isGuest && cart.items.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center">
                <span className="text-yellow-500 mr-2 text-xl">🛍️</span>
                <p className="text-yellow-700">
                  You're shopping as a guest. Your cart items will be saved locally.
                </p>
              </div>
              <Link
                to="/login"
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-blue-600 hover:to-purple-600 transition"
              >
                Sign in to save cart
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {cart.items.length === 0 ? (
              <div className="p-8 md:p-12 text-center bg-white rounded-2xl shadow-xl border border-gray-200">
                <div className="text-6xl md:text-8xl mb-4 md:mb-6 text-gray-300">
                  🛒
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 md:mb-3">
                  Your cart is empty
                </h3>
                <p className="text-gray-600 mb-6 md:mb-8 max-w-md mx-auto px-4">
                  Add some amazing products to your cart and start shopping!
                </p>
                <Link
                  to="/shop"
                  className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-bold text-base md:text-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group"
                >
                  <FaShoppingCart className="mr-2 md:mr-3" />
                  <span>Start Shopping</span>
                  <FaArrowRight className="ml-2 md:ml-3 group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
            ) : (
              <>
                {/* Cart Items List */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                  <div className="p-4 md:p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50">
                    <div className="flex flex-col sm:flex-row justify-between items-center">
                      <div className="flex flex-col sm:flex-row items-center mb-4 sm:mb-0">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full font-bold shadow-lg mb-3 sm:mb-0 sm:mr-4">
                          🛒 {cart.totalItems} Items
                        </div>
                        <div className="text-blue-600 text-center sm:text-left">
                          Total:{" "}
                          <span className="font-bold text-lg md:text-xl">
                            ₹{cart.totalPrice?.toFixed(2) || "0.00"}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          to="/shop"
                          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium group"
                        >
                          <span className="mr-2">Continue Shopping</span>
                          <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
                        </Link>
                        <button
                          onClick={clearCart}
                          className="text-red-600 hover:text-red-700 font-medium ml-4"
                        >
                          Clear Cart
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="max-h-[500px] overflow-y-auto">
                    <div className="divide-y divide-gray-100">
                      {cart.items.map((item) => (
                        <CartItem key={getCartItemKey(item)} item={item} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Promo Section */}
                <div className="p-4 md:p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
                  <div className="flex items-center mb-4 md:mb-6">
                    <div className="bg-gradient-to-r from-blue-400 to-purple-400 text-white p-2 md:p-3 rounded-full mr-3 md:mr-4">
                      <FaGift className="text-lg md:text-xl" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg md:text-xl text-gray-800">
                        Have a Promo Code?
                      </h3>
                      <p className="text-gray-600 text-sm md:text-base">
                        Enter promo code for discounts
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                    <div className="flex-grow">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Enter promo code..."
                        className="w-full px-4 py-3 md:py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      />
                    </div>
                    <button
                      onClick={applyPromoCode}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold transition-all duration-300 hover:shadow-lg hover:-translate-y-1 whitespace-nowrap"
                    >
                      Apply Code
                    </button>
                  </div>
                  <div className="mt-4 md:mt-6 grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                      <div className="text-sm font-medium text-blue-600">
                        WELCOME10
                      </div>
                      <div className="text-xs text-gray-500">
                        10% off first order
                      </div>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                      <div className="text-sm font-medium text-purple-600">
                        FREESHIP
                      </div>
                      <div className="text-xs text-gray-500">
                        Free shipping
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Order Summary - Right Column */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h3 className="font-bold text-xl text-gray-800 mb-4">
                  Order Summary
                </h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{cart.totalPrice?.toFixed(2) || "0.00"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    {shippingCharge === 0 ? (
                      <span className="font-medium text-green-600">FREE</span>
                    ) : (
                      <span className="font-medium text-gray-800">₹{shippingCharge.toFixed(2)}</span>
                    )}
                  </div>
                  {shippingCharge > 0 && cart.totalPrice > 0 && (
                    <div className="text-xs text-blue-600">
                      Add ₹{(1999 - cart.totalPrice).toFixed(2)} more to get free shipping!
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>₹{finalTotal?.toFixed(2) || "0.00"}</span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button - Direct navigation to checkout */}
                <button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-4 rounded-xl font-bold transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group shadow-lg mb-4"
                >
                  <span className="mr-2">
                    Proceed to Checkout
                  </span>
                  <FaArrowRight className="inline group-hover:translate-x-2 transition-transform" />
                </button>

                {cart.isGuest && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      Want to save your cart?
                    </p>
                    <Link
                      to="/login"
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      Sign in or Create Account
                    </Link>
                  </div>
                )}
              </div>
              
              {/* Continue Shopping */}
              <Link
                to="/shop"
                className="w-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 border-2 border-gray-200 px-6 py-4 rounded-xl font-bold transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group text-center"
              >
                <FaArrowRight className="mr-2 rotate-180 group-hover:-translate-x-1 transition-transform" />
                <span>Continue Shopping</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;