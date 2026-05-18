import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';
import { 
  FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash, 
  FaStar, FaUpload, FaSave, FaTimes,
  FaBox, FaImage, FaSpinner
} from 'react-icons/fa';

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isFeatured: false,
    isActive: true,
    order: 0
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await api.get('/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const allCategories = response.data.data || [];
      console.log('Fetched categories:', allCategories);
      setCategories(allCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Category name is required';
    }
    
    if (formData.name.length > 100) {
      errors.name = 'Category name must be less than 100 characters';
    }
    
    if (formData.description.length > 500) {
      errors.description = 'Description must be less than 500 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be less than 2MB');
        setFormErrors(prev => ({
          ...prev,
          image: 'Image must be less than 2MB'
        }));
        return;
      }
      
      // Check file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Only JPEG, PNG, and WebP images are allowed');
        setFormErrors(prev => ({
          ...prev,
          image: 'Invalid image format'
        }));
        return;
      }
      
      setImageFile(file);
      setFormErrors(prev => ({ ...prev, image: '' }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setUploading(true);
    
    try {
      const token = localStorage.getItem('token');
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
      let config = {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      };
      
      if (editingCategory) {
        console.log('Updating category:', editingCategory._id);
        response = await api.put(`/categories/${editingCategory._id}`, formDataToSend, config);
        toast.success('Category updated successfully');
      } else {
        console.log('Creating new category');
        response = await api.post('/categories', formDataToSend, config);
        toast.success('Category created successfully');
      }
      
      console.log('Category saved:', response.data);
      resetForm();
      fetchCategories();
      
    } catch (error) {
      console.error('Error saving category:', error);
      console.error('Error response:', error.response);
      
      let errorMessage = 'Failed to save category';
      
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 401) {
          errorMessage = 'Please login to continue';
        } else if (status === 403) {
          errorMessage = 'You do not have permission to perform this action';
        } else if (status === 400) {
          errorMessage = data.message || 'Invalid data provided';
        } else if (status === 409) {
          errorMessage = data.message || 'Category already exists';
        } else if (status === 413) {
          errorMessage = 'File size too large. Maximum size is 5MB.';
        } else if (data?.message) {
          errorMessage = data.message;
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      isFeatured: category.isFeatured || false,
      isActive: category.isActive !== false,
      order: category.order || 0
    });
    setImagePreview(category.image?.url || null);
    setImageFile(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/categories/${categoryId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete category';
      toast.error(errorMessage);
    }
  };

  const handleToggleActive = async (categoryId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/categories/${categoryId}/toggle-active`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      toast.success(`Category ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      fetchCategories();
    } catch (error) {
      console.error('Error toggling category status:', error);
      toast.error('Failed to update category status');
    }
  };

  const handleToggleFeatured = async (categoryId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/categories/${categoryId}/toggle-featured`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
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
      isFeatured: false,
      isActive: true,
      order: 0
    });
    setImageFile(null);
    setImagePreview(null);
    setEditingCategory(null);
    setFormErrors({});
    setShowForm(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const event = { target: { files: [file] } };
      handleImageChange(event);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Category Management</h1>
          <p className="text-gray-600">Manage product categories</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all flex items-center w-full md:w-auto justify-center"
        >
          <FaPlus className="mr-2" /> Add Category
        </button>
      </div>

      {/* Category Form */}
      {showForm && (
        <div className="mb-8 bg-white rounded-xl shadow-lg p-4 md:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl md:text-2xl font-bold">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h2>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close form"
            >
              <FaTimes size={24} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                      formErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                    placeholder="Enter category name"
                    maxLength="100"
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                  )}
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
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                      formErrors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter category description..."
                    maxLength="500"
                  />
                  <div className="flex justify-between mt-1">
                    {formErrors.description && (
                      <p className="text-sm text-red-600">{formErrors.description}</p>
                    )}
                    <p className="text-sm text-gray-500 ml-auto">
                      {formData.description.length}/500
                    </p>
                  </div>
                </div>

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
                    min="0"
                    placeholder="Display order"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Lower numbers appear first
                  </p>
                </div>
              </div>
              
              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Image
                  </label>
                  <div 
                    className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-pink-400 transition-colors ${
                      formErrors.image ? 'border-red-500' : 'border-gray-300'
                    }`}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('image-upload').click()}
                  >
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-h-48 mx-auto rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setImageFile(null);
                            setImagePreview(null);
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ) : (
                      <div className="py-8">
                        <FaUpload className="mx-auto text-4xl text-gray-400 mb-4" />
                        <p className="text-gray-600">Click to upload or drag & drop</p>
                        <p className="text-sm text-gray-500 mt-1">
                          PNG, JPG, WebP up to 2MB
                        </p>
                      </div>
                    )}
                  </div>
                  {formErrors.image && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.image}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    This image will be used as the category icon. Recommended size: 400x400px.
                  </p>
                </div>
                
                <div className="space-y-4">
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
                  
                  <div className="flex items-center">
                    <input
                      id="featured-checkbox"
                      type="checkbox"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleInputChange}
                      className="h-5 w-5 rounded text-pink-500 focus:ring-pink-400"
                    />
                    <label htmlFor="featured-checkbox" className="ml-2 text-sm font-medium text-gray-700">
                      Mark as Featured (will appear on homepage)
                    </label>
                  </div>
                  
                  <div className="pt-4">
                    <div className="flex flex-col sm:flex-row justify-end gap-3">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={uploading}
                        className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {uploading ? (
                          <>
                            <FaSpinner className="animate-spin mr-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <FaSave className="mr-2" />
                            {editingCategory ? 'Update' : 'Create'} Category
                          </>
                        )}
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
        <div className="px-4 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">All Categories</h3>
              <p className="text-sm text-gray-500">
                Total: {categories.length} categories
              </p>
            </div>
            <div className="text-sm text-gray-600">
              <span className="inline-flex items-center mr-4">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-1"></span>
                Active
              </span>
              <span className="inline-flex items-center">
                <span className="w-3 h-3 bg-red-500 rounded-full mr-1"></span>
                Inactive
              </span>
            </div>
          </div>
        </div>
        
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 text-gray-300">
              <FaBox />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Categories Found</h3>
            <p className="text-gray-600 mb-6">Create your first category to get started!</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all flex items-center mx-auto"
            >
              <FaPlus className="mr-2" /> Add First Category
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Icon
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Featured
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 flex items-center justify-center text-gray-700 font-bold text-sm mr-3">
                          {category.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {category.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {category.description || 'No description'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        {category.image?.url ? (
                          <img
                            src={category.image.url}
                            alt={category.name}
                            className="w-8 h-8 rounded-full object-cover border border-gray-300"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(category.name)}&background=random`;
                            }}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 flex items-center justify-center text-white text-xs">
                            {category.name.charAt(0)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-center">
                        <div className="font-medium text-gray-900">
                          {category.productCount || 0}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleToggleActive(category._id, category.isActive)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
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
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleToggleFeatured(category._id, category.isFeatured)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          category.isFeatured
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        <FaStar className={`mr-1 ${category.isFeatured ? 'text-yellow-500' : 'text-gray-400'}`} />
                        {category.isFeatured ? 'Yes' : 'No'}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(category._id)}
                          disabled={category.productCount > 0}
                          className={`p-1 rounded ${
                            category.productCount > 0 
                              ? 'text-gray-400 cursor-not-allowed' 
                              : 'text-red-600 hover:text-red-900 hover:bg-red-50'
                          }`}
                          title={category.productCount > 0 
                            ? "Cannot delete category with products" 
                            : "Delete"}
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
        )}
      </div>
    </div>
  );
};

export default CategoryManager;