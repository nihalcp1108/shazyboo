import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      try {
        setWishlistItems(JSON.parse(savedWishlist));
      } catch (error) {
        console.error('Failed to parse wishlist', error);
      }
    }
  }, []);

  const saveWishlist = (items) => {
    setWishlistItems(items);
    localStorage.setItem('wishlist', JSON.stringify(items));
  };

  const addToWishlist = (product) => {
    const isExists = wishlistItems.find((item) => item._id === product._id);
    if (isExists) {
      toast.error('Product is already in your wishlist');
      return;
    }
    const newItems = [...wishlistItems, product];
    saveWishlist(newItems);
    toast.success('Added to wishlist');
  };

  const removeFromWishlist = (productId) => {
    const newItems = wishlistItems.filter((item) => item._id !== productId);
    saveWishlist(newItems);
    toast.success('Removed from wishlist');
  };

  const toggleWishlist = (product) => {
    const isExists = wishlistItems.find((item) => item._id === product._id);
    if (isExists) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item._id === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, addToWishlist, removeFromWishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};
