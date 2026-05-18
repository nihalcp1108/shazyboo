import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { api } from '../services/api';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        try {
            const savedCart = localStorage.getItem('cart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error('Error loading cart:', error);
            return [];
        }
    });
    const [loading, setLoading] = useState(false);
    const [cartTotal, setCartTotal] = useState(0);
    const [cartCount, setCartCount] = useState(0);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
        updateCartSummary(cartItems);
    }, [cartItems]);

    const updateCartSummary = (items) => {
        let total = 0;
        let count = 0;
        
        items.forEach(item => {
            // Calculate price with color variation
            let itemPrice = item.discountPrice && item.discountPrice > 0 
                ? item.discountPrice 
                : item.price;
            
            // Add color extra price if any
            if (item.selectedColorPrice) {
                itemPrice += item.selectedColorPrice;
            }
            
            total += itemPrice * item.quantity;
            count += item.quantity;
        });
        
        setCartTotal(total);
        setCartCount(count);
    };

    // Generate unique key for cart item (including color)
    const getCartItemKey = (item) => {
        if (item.selectedColor) {
            return `${item._id}-${item.selectedColor}`;
        }
        return item._id;
    };

    const addToCart = async (product, quantity = 1) => {
        try {
            // Check if product has colors and validate selection
            if (product.colors && product.colors.length > 0 && !product.selectedColor) {
                toast.error('Please select a color before adding to cart');
                return false;
            }

            // Check stock availability
            let availableStock = product.stock;
            if (product.selectedColorData) {
                availableStock = product.selectedColorData.stock;
            } else if (product.colors && product.colors.length > 0 && product.selectedColor) {
                const selectedColorObj = product.colors.find(c => c.name === product.selectedColor);
                if (selectedColorObj) {
                    availableStock = selectedColorObj.stock;
                }
            }

            if (availableStock < quantity) {
                toast.error(`Only ${availableStock} items available in stock`);
                return false;
            }

            const cartItem = {
                _id: product._id,
                name: product.name,
                price: product.price,
                discountPrice: product.discountPrice,
                images: product.images,
                stock: product.stock,
                selectedColor: product.selectedColor || null,
                selectedColorName: product.selectedColor || null,
                selectedColorCode: product.selectedColorCode || null,
                selectedColorPrice: product.selectedColorPrice || 0,
                selectedColorData: product.selectedColorData || null,
                quantity: quantity
            };

            const itemKey = getCartItemKey(cartItem);
            const existingItemIndex = cartItems.findIndex(item => getCartItemKey(item) === itemKey);

            if (existingItemIndex !== -1) {
                // Update existing item
                const newQuantity = cartItems[existingItemIndex].quantity + quantity;
                
                // Check stock again for update
                if (availableStock < newQuantity) {
                    toast.error(`Cannot add more. Only ${availableStock} items available`);
                    return false;
                }
                
                const updatedItems = [...cartItems];
                updatedItems[existingItemIndex].quantity = newQuantity;
                setCartItems(updatedItems);
                
                const colorText = cartItem.selectedColor ? ` (${cartItem.selectedColor})` : '';
                toast.success(`Added ${quantity} more ${cartItem.name}${colorText} to cart 🛒`);
            } else {
                // Add new item
                setCartItems([...cartItems, cartItem]);
                const colorText = cartItem.selectedColor ? ` in ${cartItem.selectedColor}` : '';
                toast.success(`${cartItem.name}${colorText} added to cart 🛒`);
            }
            
            return true;
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Failed to add item to cart');
            return false;
        }
    };

    const removeFromCart = (itemKey) => {
        const itemToRemove = cartItems.find(item => getCartItemKey(item) === itemKey);
        if (itemToRemove) {
            setCartItems(cartItems.filter(item => getCartItemKey(item) !== itemKey));
            const colorText = itemToRemove.selectedColor ? ` (${itemToRemove.selectedColor})` : '';
            toast.success(`${itemToRemove.name}${colorText} removed from cart`);
        }
    };

    const updateQuantity = (itemKey, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(itemKey);
            return;
        }

        const itemIndex = cartItems.findIndex(item => getCartItemKey(item) === itemKey);
        if (itemIndex !== -1) {
            const item = cartItems[itemIndex];
            
            // Check stock availability
            let maxStock = item.stock;
            if (item.selectedColorData) {
                maxStock = item.selectedColorData.stock;
            } else if (item.selectedColor && item.colors) {
                const colorObj = item.colors.find(c => c.name === item.selectedColor);
                if (colorObj) {
                    maxStock = colorObj.stock;
                }
            }
            
            if (newQuantity > maxStock) {
                toast.error(`Only ${maxStock} items available in stock`);
                return;
            }
            
            const updatedItems = [...cartItems];
            updatedItems[itemIndex].quantity = newQuantity;
            setCartItems(updatedItems);
        }
    };

    const clearCart = () => {
        setCartItems([]);
        toast.success('Cart cleared');
    };

    const getCartItemsWithDetails = async () => {
        if (cartItems.length === 0) return [];
        
        try {
            // Fetch fresh product data for each item
            const itemsWithDetails = await Promise.all(
                cartItems.map(async (item) => {
                    try {
                        const response = await api.get(`/products/${item._id}`);
                        const product = response.data.data;
                        
                        // Find color data if applicable
                        let colorData = null;
                        if (item.selectedColor && product.colors) {
                            colorData = product.colors.find(c => c.name === item.selectedColor);
                        }
                        
                        // Calculate current price
                        let currentPrice = product.discountPrice && product.discountPrice > 0 
                            ? product.discountPrice 
                            : product.price;
                        
                        if (colorData && colorData.additionalPrice) {
                            currentPrice += colorData.additionalPrice;
                        }
                        
                        return {
                            ...item,
                            product,
                            colorData,
                            currentPrice,
                            availableStock: colorData ? colorData.stock : product.stock,
                            image: product.images?.find(img => img.isDefault)?.url || product.images?.[0]?.url
                        };
                    } catch (error) {
                        console.error(`Error fetching product ${item._id}:`, error);
                        return item;
                    }
                })
            );
            
            return itemsWithDetails;
        } catch (error) {
            console.error('Error getting cart items with details:', error);
            return cartItems;
        }
    };

    const getCartSummary = () => {
        let subtotal = 0;
        let discount = 0;
        let total = 0;
        
        cartItems.forEach(item => {
            let itemPrice = item.discountPrice && item.discountPrice > 0 ? item.discountPrice : item.price;
            if (item.selectedColorPrice) {
                itemPrice += item.selectedColorPrice;
            }
            const itemTotal = itemPrice * item.quantity;
            subtotal += itemTotal;
            
            if (item.discountPrice && item.discountPrice > 0) {
                const originalTotal = item.price * item.quantity;
                discount += originalTotal - itemTotal;
            }
        });
        
        const shipping = subtotal > 500 ? 0 : 50;
        total = subtotal + shipping;
        
        return {
            subtotal,
            discount,
            shipping,
            total,
            itemCount: cartCount,
            itemTotal: cartItems.reduce((sum, item) => sum + item.quantity, 0)
        };
    };

    const value = {
        cartItems,
        cartTotal,
        cartCount,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartItemsWithDetails,
        getCartSummary,
        getCartItemKey
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;