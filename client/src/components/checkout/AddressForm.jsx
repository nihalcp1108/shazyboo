import { useCart } from "../../Context/CartContext";
import { Link } from "react-router-dom";
import { FaArrowRight, FaGift, FaTags, FaShieldAlt } from "react-icons/fa";

const CartSummary = () => {
  const { cart } = useCart();

  const subtotal = cart.totalPrice || 0;
  const shipping = subtotal > 2999 ? 0 : 50;
  const total = subtotal + shipping;

  if (cart.items.length === 0) {
    return (
      <div className="p-6 bg-gradient-to-br from-white to-pink-50 rounded-2xl shadow-xl border border-pink-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <FaGift className="text-pink-400 mr-2" />
          Order Summary 🎁
        </h2>
        <div className="text-center py-8">
          <div className="text-4xl mb-3">📝</div>
          <p className="text-gray-600">Add some cute items to see your order summary!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-yellow-50 rounded-2xl shadow-xl border border-yellow-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-yellow-100">
        <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
          <FaGift className="text-orange-400 mr-2" />
          Order Summary ✨
        </h2>
        <p className="text-sm text-gray-600">Review your adorable purchases</p>
      </div>

      {/* Price Breakdown */}
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-bold">₹{subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Shipping</span>
          <span className={`font-bold ${shipping === 0 ? 'text-green-600' : ''}`}>
            {shipping === 0 ? 'FREE! 🎉' : `₹${shipping.toFixed(2)}`}
          </span>
        </div>

        {/* Discount Section */}
        <div className="pt-4 border-t border-yellow-100">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-600">Discount</span>
            <span className="font-bold text-green-600">-₹0.00</span>
          </div>
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-3 rounded-lg border border-pink-100">
            <p className="text-sm text-gray-600 mb-2 flex items-center">
              <FaTags className="text-pink-400 mr-2" />
              Have a coupon code? Apply it above!
            </p>
          </div>
        </div>

        {/* Total */}
        <div className="pt-4 border-t-2 border-pink-200">
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total Amount</span>
            <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              ₹{total.toFixed(2)}
            </span>
          </div>
          {shipping === 0 && (
            <div className="mt-3 px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 font-medium">
                🎉 You saved ₹50 on shipping!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Secure Payment Info */}
      <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-t border-blue-100">
        <div className="flex items-center mb-3">
          <FaShieldAlt className="text-blue-400 mr-2" />
          <span className="font-medium text-gray-800">Secure Payment</span>
        </div>
        <p className="text-sm text-gray-600">
          100% secure checkout. We protect your payment information with encryption.
        </p>
        <div className="mt-4 grid grid-cols-4 gap-2">
          <div className="bg-white p-2 rounded-lg border border-gray-200 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-700">VISA</span>
          </div>
          <div className="bg-white p-2 rounded-lg border border-gray-200 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-700">MC</span>
          </div>
          <div className="bg-white p-2 rounded-lg border border-gray-200 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-700">UPI</span>
          </div>
          <div className="bg-white p-2 rounded-lg border border-gray-200 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-700">NET</span>
          </div>
        </div>
      </div>

      {/* Estimated Delivery */}
      <div className="p-6 border-t border-pink-100">
        <div className="flex items-start">
          <div className="bg-pink-100 text-pink-600 p-2 rounded-lg mr-3">
            🚚
          </div>
          <div>
            <div className="font-medium text-gray-800">Estimated Delivery</div>
            <div className="text-sm text-gray-600">2-3 business days</div>
            <div className="text-xs text-gray-500 mt-1">
              Free gift wrapping included! 🎀
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
