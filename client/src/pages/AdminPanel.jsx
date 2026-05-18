import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  FaHome, 
  FaUsers, 
  FaBox, 
  FaShoppingCart, 
  FaTags, 
  FaStar, 
  FaChartLine,
  FaSignOutAlt,
  FaCrown,
  FaUserShield,
  FaStore,
  FaClipboardList
} from 'react-icons/fa';

// Import admin components
import Dashboard from '../components/Admin/Dashboard';
import UsersList from '../components/Admin/UserManager';
import ProductsList from '../components/Admin/ProductManager';
import AdminProductDetails from '../components/Admin/AdminProductDetails';
import OrdersList from '../components/Admin/OrderManager';
import CategoriesList from '../components/Admin/CategoryManager';
import MainCategoryManager from '../components/Admin/MainCategoryManager';

const AdminPanel = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Check if user is admin
    if (!isAdmin) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/');
    }
  }, [isAdmin, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: <FaHome />, label: 'Dashboard' },
    { path: '/admin/users', icon: <FaUsers />, label: 'Users' },
    { path: '/admin/products', icon: <FaBox />, label: 'Products' },
    { path: '/admin/categories', icon: <FaTags />, label: 'Categories' },
    { path: '/admin/orders', icon: <FaShoppingCart />, label: 'Orders' },
    { path: '/admin/main-categories', icon: <FaTags />, label: 'Main Categories' },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-purple-800 to-indigo-900 text-white transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b border-purple-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FaCrown className="text-yellow-400 text-2xl" />
              {sidebarOpen && (
                <span className="font-bold text-lg">Admin Panel</span>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 rounded-lg hover:bg-purple-700 transition"
            >
              {sidebarOpen ? '◀' : '▶'}
            </button>
          </div>
        </div>

        {/* User Info */}
        {sidebarOpen && (
          <div className="p-4 border-b border-purple-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
                <FaUserShield className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm">{user?.name || 'Admin'}</p>
                <p className="text-xs text-purple-300">Administrator</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 mx-2 rounded-lg transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                  : 'hover:bg-purple-700/50 text-purple-100'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="ml-3 text-sm font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-purple-700">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-purple-700/50 transition-all duration-200 text-purple-100"
          >
            <FaSignOutAlt className="text-xl" />
            {sidebarOpen && <span className="ml-3 text-sm font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden">
        <div className="p-6">
          <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<UsersList />} />
            <Route path="products" element={<ProductsList />} />
            <Route path="products/new" element={<AdminProductDetails />} />
            <Route path="products/edit/:id" element={<AdminProductDetails />} />
            <Route path="products/details/:id" element={<AdminProductDetails />} />
            <Route path="categories" element={<CategoriesList />} />
            <Route path="orders" element={<OrdersList />} />
            <Route index element={<Dashboard />} />
            <Route path="main-categories" element={<MainCategoryManager />} />

          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;