import { useState, useEffect, useRef } from 'react';
import { 
    FaPlus, FaEdit, FaTrash, FaSearch, FaTimes,
    FaUpload, FaSpinner, FaToggleOn, FaToggleOff, FaStar,
    FaCrown
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { getImageUrl } from '../../utils/imageUtils';

const MainCategoryManager = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: '🎨',
        order: 0,
        featured: false,
        isActive: true
    });
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [serverStatus, setServerStatus] = useState('checking');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    const BASE_URL = API_URL.replace('/api', '');

    const getAuthInfo = () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
        return { token, user };
    };

    const checkServerConnection = async () => {
        try {
            const response = await fetch(`${BASE_URL}/health`);
            if (response.ok) {
                setServerStatus('connected');
                return true;
            }
        } catch (error) {
            console.error('Server connection failed:', error);
            setServerStatus('disconnected');
            toast.error('Cannot connect to backend server. Please make sure the server is running.');
            return false;
        }
        return false;
    };

    useEffect(() => {
        const { user } = getAuthInfo();
        setIsAdmin(user?.role === 'admin');
        checkServerConnection().then(connected => {
            if (connected) {
                fetchCategories();
            } else {
                setLoading(false);
            }
        });
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const { token } = getAuthInfo();
            
            const response = await fetch(`${API_URL}/main-categories`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.status === 404) {
                console.warn('Main categories endpoint not found - server might not have routes configured');
                setCategories([]);
                toast.error('Main categories API not configured on server');
                return;
            }
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            setCategories(data.data || []);
            setServerStatus('connected');
        } catch (error) {
            console.error('Error fetching main categories:', error);
            if (error.message.includes('Failed to fetch')) {
                toast.error('Cannot connect to server. Please start the backend server first.');
                setServerStatus('disconnected');
            } else {
                toast.error(error.message || 'Failed to fetch main categories');
            }
        } finally {
            setLoading(false);
        }
    };

    // Using getImageUrl from imageUtils

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Image size should be less than 2MB');
                return;
            }
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name.trim()) {
            toast.error('Category name is required');
            return;
        }

        const { token, user } = getAuthInfo();
        if (!token || user?.role !== 'admin') {
            toast.error('Admin access required');
            return;
        }

        setUploading(true);
        
        try {
            const submitFormData = new FormData();
            submitFormData.append('name', formData.name.trim());
            submitFormData.append('description', formData.description);
            submitFormData.append('icon', formData.icon);
            submitFormData.append('order', formData.order);
            submitFormData.append('featured', formData.featured);
            submitFormData.append('isActive', formData.isActive);
            
            if (selectedImage) {
                submitFormData.append('image', selectedImage);
            }

            const url = editingCategory 
                ? `${API_URL}/main-categories/${editingCategory._id}`
                : `${API_URL}/main-categories`;
            
            const method = editingCategory ? 'PUT' : 'POST';
            
            console.log(`Sending ${method} request to:`, url);
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: submitFormData
            });

            const data = await response.json();

            if (response.status === 404) {
                throw new Error('API endpoint not found. Please check if main categories routes are properly configured on the server.');
            }

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Failed to save category');
            }

            toast.success(editingCategory ? 'Main category updated successfully' : 'Main category created successfully');
            setShowModal(false);
            resetForm();
            fetchCategories();
        } catch (error) {
            console.error('Error saving main category:', error);
            toast.error(error.message || 'Failed to save main category');
        } finally {
            setUploading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            icon: '🎨',
            order: 0,
            featured: false,
            isActive: true
        });
        setSelectedImage(null);
        setImagePreview('');
        setEditingCategory(null);
    };

    const openEditModal = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            icon: category.icon || '🎨',
            order: category.order || 0,
            featured: category.featured || false,
            isActive: category.isActive !== false
        });
        if (category.image) {
            setImagePreview(getImageUrl(category.image));
        }
        setShowModal(true);
    };

    const handleDelete = async (categoryId) => {
        if (!window.confirm('Are you sure you want to delete this main category?')) {
            return;
        }

        const { token, user } = getAuthInfo();
        if (!token || user?.role !== 'admin') {
            toast.error('Admin access required');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/main-categories/${categoryId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 404) {
                throw new Error('API endpoint not found');
            }

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete');
            }

            toast.success('Main category deleted successfully');
            fetchCategories();
        } catch (error) {
            console.error('Error deleting:', error);
            toast.error(error.message || 'Failed to delete main category');
        }
    };

    const handleToggleActive = async (categoryId, currentStatus) => {
        const { token, user } = getAuthInfo();
        if (!token || user?.role !== 'admin') return;

        try {
            const response = await fetch(`${API_URL}/main-categories/${categoryId}/toggle-active`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to update');
            
            toast.success(`Category ${currentStatus ? 'deactivated' : 'activated'} successfully`);
            fetchCategories();
        } catch (error) {
            console.error('Error toggling active:', error);
            toast.error('Failed to update category status');
        }
    };

    const handleToggleFeatured = async (categoryId, currentStatus) => {
        const { token, user } = getAuthInfo();
        if (!token || user?.role !== 'admin') return;

        try {
            const response = await fetch(`${API_URL}/main-categories/${categoryId}/toggle-featured`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to update');
            
            toast.success(`Category ${currentStatus ? 'removed from' : 'added to'} featured`);
            fetchCategories();
        } catch (error) {
            console.error('Error toggling featured:', error);
            toast.error('Failed to update featured status');
        }
    };

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(search.toLowerCase())
    );

    const categoryIcons = ['🎨', '📚', '🎮', '🧸', '🎲', '🧩', '🎭', '🎪', '🚂', '🎯', '⚽', '🏀'];

    if (serverStatus === 'disconnected') {
        return (
            <div className="space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
                    <div className="text-6xl mb-4">🔌</div>
                    <h3 className="text-xl font-bold text-red-800 mb-2">Cannot Connect to Server</h3>
                    <p className="text-red-700 mb-4">
                        Unable to connect to the backend server at {API_URL}
                    </p>
                    <button
                        onClick={() => {
                            setServerStatus('checking');
                            checkServerConnection().then(connected => {
                                if (connected) {
                                    fetchCategories();
                                } else {
                                    setLoading(false);
                                    setServerStatus('disconnected');
                                }
                            });
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className={`rounded-xl p-4 ${
                serverStatus === 'connected' 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-yellow-50 border border-yellow-200'
            }`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className={`font-bold ${
                            serverStatus === 'connected' ? 'text-green-800' : 'text-yellow-800'
                        }`}>
                            {serverStatus === 'connected' ? '✅ Backend Connected' : '🔄 Checking Connection...'}
                        </h4>
                        <p className="text-sm text-gray-600">API URL: {API_URL}</p>
                    </div>
                    <button
                        onClick={() => fetchCategories()}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        disabled={loading}
                    >
                        {loading ? <FaSpinner className="animate-spin" /> : 'Refresh'}
                    </button>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Main Category Management</h2>
                    <p className="text-gray-600 mt-1">Manage main categories displayed on the home page</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                        className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:shadow-lg flex items-center gap-2"
                    >
                        <FaPlus />
                        <span>Add Main Category</span>
                    </button>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-pink-100">
                <div className="relative">
                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search main categories..."
                        className="w-full pl-10 pr-4 py-3 border-2 border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-500"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <FaSpinner className="animate-spin h-10 w-10 text-pink-500" />
                    <p className="ml-3 text-gray-600">Loading categories...</p>
                </div>
            ) : categories.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl">
                    <p className="text-gray-500 mb-4">No main categories found</p>
                    {isAdmin && (
                        <button
                            onClick={() => {
                                resetForm();
                                setShowModal(true);
                            }}
                            className="text-pink-500 hover:text-pink-600 font-medium"
                        >
                            Create your first main category
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredCategories.map((category) => (
                        <div key={category._id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-pink-100 hover:shadow-xl transition-all duration-300">
                            <div className="relative h-40 bg-gradient-to-br from-pink-100 to-purple-100">
                                {category.image ? (
                                    <img
                                        src={getImageUrl(category.image)}
                                        alt={category.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-6xl">
                                        {category.icon || '🎨'}
                                    </div>
                                )}
                                {category.featured && (
                                    <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                        <FaStar size={10} />
                                        Featured
                                    </div>
                                )}
                            </div>

                            <div className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-bold text-lg text-gray-800">{category.name}</h3>
                                    <span className="text-sm text-gray-500">Order: {category.order}</span>
                                </div>
                                
                                {category.description && (
                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{category.description}</p>
                                )}
                                
                                <div className="flex items-center justify-between text-sm mb-3">
                                    <span className="text-gray-500">
                                        Subcategories: {category.subCategories?.length || 0}
                                    </span>
                                    <span className="text-gray-500">
                                        Products: {category.productCount || 0}
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    <button
                                        onClick={() => handleToggleActive(category._id, category.isActive)}
                                        className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 transition-all ${
                                            category.isActive 
                                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                                        }`}
                                    >
                                        {category.isActive ? <FaToggleOn /> : <FaToggleOff />}
                                        {category.isActive ? 'Active' : 'Inactive'}
                                    </button>
                                    
                                    <button
                                        onClick={() => handleToggleFeatured(category._id, category.featured)}
                                        className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 transition-all ${
                                            category.featured
                                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        <FaCrown size={10} />
                                        {category.featured ? 'Featured' : 'Not Featured'}
                                    </button>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openEditModal(category)}
                                        className="flex-1 px-3 py-2 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <FaEdit size={14} />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(category._id)}
                                        className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <FaTrash size={14} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && isAdmin && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800">
                                        {editingCategory ? 'Edit Main Category' : 'Add New Main Category'}
                                    </h3>
                                    <p className="text-gray-600 mt-1">
                                        Main categories appear on the home page navigation
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <FaTimes size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Category Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-500"
                                        placeholder="e.g., Toys, Books, Games"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Category Icon
                                    </label>
                                    <div className="flex gap-3 flex-wrap">
                                        {categoryIcons.map((icon, index) => (
                                            <button
                                                key={`${icon}-${index}`}
                                                type="button"
                                                onClick={() => setFormData({...formData, icon})}
                                                className={`w-12 h-12 text-2xl rounded-xl border-2 transition-all ${
                                                    formData.icon === icon
                                                        ? 'border-pink-500 bg-pink-50 scale-110'
                                                        : 'border-gray-200 hover:border-pink-300'
                                                }`}
                                            >
                                                {icon}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Category Image (Optional)
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-bold hover:shadow-lg transition-all"
                                        >
                                            <FaUpload className="inline mr-2" />
                                            Upload Image
                                        </button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            accept="image/*"
                                            onChange={handleImageSelect}
                                            className="hidden"
                                        />
                                        {imagePreview && (
                                            <div className="relative w-16 h-16">
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedImage(null);
                                                        setImagePreview('');
                                                    }}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                                >
                                                    <FaTimes size={10} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Recommended size: 400x400px, Max 2MB
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        rows="3"
                                        className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-500"
                                        placeholder="Brief description of this category..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Display Order
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.order}
                                            onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                                            className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-500"
                                            min="0"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
                                    </div>

                                    <div className="flex items-center space-x-4 pt-8">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={formData.featured}
                                                onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                                                className="w-5 h-5 text-pink-600 rounded"
                                            />
                                            <span className="text-sm font-medium">Featured Category</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                                            className="w-5 h-5 text-green-600 rounded"
                                        />
                                        <span className="text-sm font-medium">Active (visible to customers)</span>
                                    </label>
                                </div>

                                <div className="flex justify-end gap-4 pt-6 border-t border-pink-200">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            resetForm();
                                        }}
                                        className="px-6 py-2 border-2 border-pink-300 text-pink-600 rounded-xl font-bold hover:bg-pink-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {uploading ? (
                                            <>
                                                <FaSpinner className="animate-spin" />
                                                Saving...
                                            </>
                                        ) : editingCategory ? 'Update Category' : 'Create Category'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MainCategoryManager;