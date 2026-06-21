import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./Context/AuthContext";
import { CartProvider } from "./Context/CartContext";
import { WishlistProvider } from "./Context/WishlistContext";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import { useLocation } from "react-router-dom";
// Layout Components
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import ScrollToTop from "./components/layout/ScrollToTop";

// Pages
import Home from "./pages/Home";
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Shop = lazy(() => import("./pages/Shop"));
const CategoriesPage = lazy(() => import("./pages/CategoriesPage"));
const CategoryProductsPage = lazy(() => import("./pages/CategoryProductsPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const Login = lazy(() => import("./components/Auth/Login"));
const Register = lazy(() => import("./components/Auth/Register"));
const ForgotPassword = lazy(() => import("./components/Auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./components/Auth/ResetPassword"));
const OTPVerification = lazy(() => import("./components/Auth/OtpVerification"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const MainCategory = lazy(() => import("./pages/MainCategory"));
const MainCategoryProducts = lazy(() => import("./pages/MainCategoryProducts"));
const ProductDetail = lazy(() => import("./components/Products/ProductDetails"));

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="h-16 w-16 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 animate-pulse flex items-center justify-center shadow-lg">
      <span className="text-white text-xs font-bold">Loading...</span>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <ScrollToTop />
      <CartProvider>
        <WishlistProvider>
          <AuthProvider>
            <div className="min-h-screen flex flex-col overflow-x-hidden">
              <Header />
              <main className="flex-grow">
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/categories" element={<CategoriesPage />} />
                    <Route path="/categories/:slug" element={<CategoryProductsPage />} />
                    <Route path="/main-category/:slug" element={<MainCategory />} />
                    <Route path="/main-category/:slug/products" element={<MainCategoryProducts />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />

                    {/* Guest Checkout - No login required */}
                    <Route path="/checkout" element={<CheckoutPage />} />

                    {/* Order Confirmation - Public access for guests */}
                    <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />

                    {/* Auth Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />
                    <Route path="/verify-otp" element={<OTPVerification />} />

                    {/* Protected Routes (Require Login) */}
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <UserProfile />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/my-orders"
                      element={
                        <ProtectedRoute>
                          <OrdersPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Admin Routes */}
                    <Route
                      path="/admin/*"
                      element={
                        <ProtectedRoute adminOnly={true}>
                          <AdminPanel />
                        </ProtectedRoute>
                      }
                    />

                    {/* Catch-all route */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </main>
              {location.pathname === '/' && <Footer />}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: "#363636",
                    color: "#fff",
                    borderRadius: "10px",
                  },
                  success: {
                    duration: 3000,
                    style: {
                      background: "#10B981",
                    },
                    iconTheme: {
                      primary: "#fff",
                      secondary: "#10B981",
                    },
                  },
                  error: {
                    duration: 4000,
                    style: {
                      background: "#EF4444",
                    },
                    iconTheme: {
                      primary: "#fff",
                      secondary: "#EF4444",
                    },
                  },
                  loading: {
                    style: {
                      background: "#3B82F6",
                    },
                  },
                }}
              />
            </div>
          </AuthProvider>
        </WishlistProvider>
      </CartProvider>
    </Router>
  );
}

export default App;