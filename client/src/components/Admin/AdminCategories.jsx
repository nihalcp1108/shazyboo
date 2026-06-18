import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';
import { 
    FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash, 
    FaStar, FaSort, FaUpload, FaSave, FaTimes 
} from 'react-icons/fa';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: '📦',
        parentCategory: '',
        isFeatured: false,
        isActive: true,
        order: 0
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await api.get('/categories');
            setCategories(response.data.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const formDataToSend = new FormData();
            
            // Append form data
            Object.keys(formData).forEach(key => {
                formDataToSend.append(key, formData[key]);
            });
            
            // Append image if exists
            if (imageFile) {
                formDataToSend.append('image', imageFile);
            }
            
            let response;
            if (editingCategory) {
                response = await api.put(`/admin/categories/${editingCategory._id}`, formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Category updated successfully');
            } else {
                response = await api.post('/admin/categories', formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Category created successfully');
            }
            
            // Reset form and refresh
            resetForm();
            fetchCategories();
            
        } catch (error) {
            console.error('Error saving category:', error);
            toast.error('Failed to save category');
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            icon: category.icon || '📦',
            parentCategory: category.parentCategory || '',
            isFeatured: category.isFeatured || false,
            isActive: category.isActive || true,
            order: category.order || 0
        });
        setImagePreview(category.image ? getImageUrl(category.image) : null);
        setShowForm(true);
    };

    const handleDelete = async (categoryId) => {
        if (!window.confirm('Are you sure you want to delete this category?')) {
            return;
        }
        
        try {
            await api.delete(`/admin/categories/${categoryId}`);
            toast.success('Category deleted successfully');
            fetchCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
            toast.error('Failed to delete category');
        }
    };

    const handleToggleActive = async (categoryId, currentStatus) => {
        try {
            await api.put(`/admin/categories/${categoryId}/toggle-active`);
            toast.success(`Category ${currentStatus ? 'deactivated' : 'activated'} successfully`);
            fetchCategories();
        } catch (error) {
            console.error('Error toggling category status:', error);
            toast.error('Failed to update category status');
        }
    };

    const handleToggleFeatured = async (categoryId, currentStatus) => {
        try {
            await api.put(`/admin/categories/${categoryId}/toggle-featured`);
            toast.success(`Category ${currentStatus ? 'removed from featured' : 'marked as featured'} successfully`);
            fetchCategories();
        } catch (error) {
            console.error('Error toggling featured status:', error);
            toast.error('Failed to update featured status');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            icon: '📦',
            parentCategory: '',
            isFeatured: false,
            isActive: true,
            order: 0
        });
        setImageFile(null);
        setImagePreview(null);
        setEditingCategory(null);
        setShowForm(false);
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 bg-gray-100 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
                    <p className="text-gray-600">Manage product categories and subcategories</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all flex items-center"
                >
                    <FaPlus className="mr-2" /> Add Category
                </button>
            </div>

            {/* Category Form */}
            {showForm && (
                <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">
                            {editingCategory ? 'Edit Category' : 'Add New Category'}
                        </h2>
                        <button
                            onClick={resetForm}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <FaTimes size={24} />
                        </button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Icon
                                    </label>
                                    <input
                                        type="text"
                                        name="icon"
                                        value={formData.icon}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                        placeholder="Emoji or icon code"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Parent Category
                                    </label>
                                    <select
                                        name="parentCategory"
                                        value={formData.parentCategory}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    >
                                        <option value="">None (Main Category)</option>
                                        {categories
                                            .filter(cat => !cat.parentCategory)
                                            .map(category => (
                                                <option key={category._id} value={category._id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            </div>
                            
                            {/* Right Column */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category Image
                                    </label>
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                            />
                                        </div>
                                        {imagePreview && (
                                            <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-300">
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Display Order
                                        </label>
                                        <input
                                            type="number"
                                            name="order"
                                            value={formData.order}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Status
                                        </label>
                                        <select
                                            name="isActive"
                                            value={formData.isActive}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                        >
                                            <option value={true}>Active</option>
                                            <option value={false}>Inactive</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="isFeatured"
                                            checked={formData.isFeatured}
                                            onChange={handleInputChange}
                                            className="rounded text-pink-500"
                                        />
                                        <span className="ml-2 text-sm font-medium text-gray-700">
                                            Mark as Featured
                                        </span>
                                    </label>
                                    
                                    <div className="pt-4">
                                        <div className="flex justify-end space-x-4">
                                            <button
                                                type="button"
                                                onClick={resetForm}
                                                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-2 rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all flex items-center"
                                            >
                                                <FaSave className="mr-2" />
                                                {editingCategory ? 'Update' : 'Create'} Category
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Categories List */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Products
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Featured
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {categories.map((category) => (
                                <tr key={category._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 flex items-center justify-center text-white text-lg mr-3">
                                                {category.icon}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {category.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {category.parentCategory ? 'Subcategory' : 'Main Category'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            category.parentCategory 
                                                ? 'bg-blue-100 text-blue-800' 
                                                : 'bg-green-100 text-green-800'
                                        }`}>
                                            {category.parentCategory ? 'Subcategory' : 'Main Category'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {category.productCount || 0}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleToggleActive(category._id, category.isActive)}
                                            className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                                category.isActive
                                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                                            }`}
                                        >
                                            {category.isActive ? (
                                                <>
                                                    <FaEye className="mr-1" /> Active
                                                </>
                                            ) : (
                                                <>
                                                    <FaEyeSlash className="mr-1" /> Inactive
                                                </>
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleToggleFeatured(category._id, category.isFeatured)}
                                            className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                                category.isFeatured
                                                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                            }`}
                                        >
                                            <FaStar className="mr-1" />
                                            {category.isFeatured ? 'Featured' : 'Normal'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={() => handleEdit(category)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(category._id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {categories.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📦</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Categories Found</h3>
                        <p className="text-gray-600 mb-6">Create your first category to get started!</p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all flex items-center mx-auto"
                        >
                            <FaPlus className="mr-2" /> Add First Category
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminCategories;