export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID
export const CLIENT_URL = import.meta.env.VITE_CLIENT_URL || 'http://localhost:3000'

// You can also define other constants here
export const CATEGORIES = [
  'Electronics',
  'Clothing',
  'Books',
  'Home & Kitchen',
  'Sports',
  'Beauty',
  'Toys',
  'Automotive',
  'Other'
]

export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
}