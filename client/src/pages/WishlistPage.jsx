import { useWishlist } from '../Context/WishlistContext';
import ProductCard from '../components/Products/ProductsCard';
import { FaHeart, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const WishlistPage = () => {
  const { wishlistItems } = useWishlist();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-pink-100 rounded-full px-6 py-3 mb-4 shadow-sm">
            <FaHeart className="text-pink-500 mr-3 text-xl" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Your Wishlist
            </h1>
          </div>
          <p className="text-gray-600">
            {wishlistItems.length === 0
              ? "Your wishlist is empty."
              : `You have ${wishlistItems.length} ${wishlistItems.length === 1 ? 'item' : 'items'} in your wishlist`}
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center max-w-2xl mx-auto">
            <div className="text-6xl text-gray-200 mb-6 flex justify-center">
              <FaHeart />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Nothing here yet</h3>
            <p className="text-gray-500 mb-8">
              Found something you love? Tap the heart icon to add it to your wishlist and save it for later!
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center justify-center bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-3 rounded-full font-bold hover:shadow-lg hover:-translate-y-1 transition-all group"
            >
              <span>Explore Products</span>
              <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {wishlistItems.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
