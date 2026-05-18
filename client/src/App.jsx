import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import ProtectedRoute from "./components/Auth/ProtectedRoute";

// Layout Components
import Header from "./components/Layout/Header";
import Footer from "./components/Layout/Footer";
import ScrollToTop from "./components/Layout/ScrollToTop";

// Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Shop from "./pages/Shop";
import CategoriesPage from "./pages/CategoriesPage";
import CategoryProductsPage from "./pages/CategoryProductsPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import WishlistPage from "./pages/WishlistPage";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import ForgotPassword from "./components/Auth/ForgotPassword";
import ResetPassword from "./components/Auth/ResetPassword";
import OTPVerification from "./components/Auth/OtpVerification";
import UserProfile from "./pages/UserProfile";
import AdminPanel from "./pages/AdminPanel";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrdersPage from "./pages/OrdersPage";
import MainCategory from "./pages/MainCategory";
import MainCategoryProducts from "./pages/MainCategoryProducts";
import ProductDetail from "./components/Products/ProductDetails";

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
            </main>
            <Footer />
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