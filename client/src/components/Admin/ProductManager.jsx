import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
    FaEdit, FaTrash, FaEye, FaPlus, FaSearch, FaStar, 
    FaFire, FaTag, FaBoxOpen, FaToggleOn, FaToggleOff,
    FaImage, FaTimes, FaUpload, FaCheck, FaSpinner,
    FaInfoCircle, FaArrowLeft, FaCrown, FaRocket, FaChartLine,
    FaFolder, FaFolderOpen, FaLayerGroup, FaList, FaPalette,
    FaSave, FaUndo, FaClone, FaPrint
} from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import { api } from '../../services/api'; import { getImageUrl, handleImageError, getFallbackImage } from '../../utils/imageUtils';

const ProductManager = () => {
    const navigate = useNavigate()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [showModal, setShowModal] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        shortDescription: '',
        price: '',
        discountPrice: '',
        mainCategory: '',
        category: '',
        subCategory: '',
        stock: '',
        tags: '',
        isFeatured: false,
        isTrending: false,
        isNewArrival: false,
        isBestSeller: false,
        isActive: true
    })
    const [uploading, setUploading] = useState(false)
    const [selectedImages, setSelectedImages] = useState([])
    const [deletedImages, setDeletedImages] = useState([])
    const [isAdmin, setIsAdmin] = useState(false)
    const [filter, setFilter] = useState('all')
    
    const [mainCategories, setMainCategories] = useState([])
    const [popularCategories, setPopularCategories] = useState([])
    const [subCategories, setSubCategories] = useState([])
    const [loadingCategories, setLoadingCategories] = useState(false)

    // Color management state
    const [colors, setColors] = useState([])
    const [editingColorIndex, setEditingColorIndex] = useState(null)
    const [colorFormData, setColorFormData] = useState({
        name: '',
        code: '#000000',
        image: '',
        stock: 0,
        additionalPrice: 0
    })

    const fileInputRef = useRef(null)
    const colorImageInputRef = useRef(null)
    
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    const BASE_URL = API_URL.replace('/api', '');

    const getAuthInfo = () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
        return { token, user };
    }

    useEffect(() => {
        const { token, user } = getAuthInfo();
        setIsAdmin(user?.role === 'admin');
        fetchProducts();
        fetchMainCategories();
        fetchPopularCategories();
    }, [page, search, filter])

    const fetchMainCategories = async () => {
        try {
            const response = await api.get('/main-categories');
            const mainCats = response.data.data || [];
            setMainCategories(mainCats);
            console.log('Main Categories loaded:', mainCats.length);
        } catch (error) {
            console.error('Error fetching main categories:', error);
            toast.error('Failed to load main categories');
        }
    }

    const fetchPopularCategories = async () => {
        try {
            setLoadingCategories(true);
            const response = await api.get('/categories');
            const allCategories = response.data.data || [];
            setPopularCategories(allCategories);
            console.log('Popular Categories loaded:', allCategories.length);
        } catch (error) {
            console.error('Error fetching popular categories:', error);
            toast.error('Failed to load popular categories');
        } finally {
            setLoadingCategories(false);
        }
    }

    const handleMainCategoryChange = (e) => {
        const value = e.target.value;
        console.log('Main category selected:', value);
        setFormData(prev => ({ ...prev, mainCategory: value }));
    }

    const handleCategoryChange = (e) => {
        const value = e.target.value;
        console.log('Popular category selected:', value);
        setFormData(prev => ({ ...prev, category: value, subCategory: '' }));
        
        if (value) {
            const selectedCategory = popularCategories.find(cat => cat._id === value);
            if (selectedCategory && selectedCategory.subCategories) {
                setSubCategories(selectedCategory.subCategories);
            } else {
                const subs = popularCategories.filter(cat => cat.parentCategory?._id === value || cat.parentCategory === value);
                setSubCategories(subs);
            }
        } else {
            setSubCategories([]);
        }
    }

    const handleAddColor = () => {
        if (!colorFormData.name.trim()) {
            toast.error('Please enter color name');
            return;
        }
        
        const stockValue = parseInt(colorFormData.stock);
        if (isNaN(stockValue) || stockValue < 0) {
            toast.error('Please enter a valid stock quantity');
            return;
        }
        
        if (colorFormData.additionalPrice < 0) {
            toast.error('Additional price cannot be negative');
            return;
        }
        
        if (editingColorIndex !== null) {
            const updatedColors = [...colors];
            updatedColors[editingColorIndex] = { ...colorFormData, stock: stockValue };
            setColors(updatedColors);
            setEditingColorIndex(null);
            toast.success('Color updated successfully');
        } else {
            if (colors.some(c => c.name.toLowerCase() === colorFormData.name.toLowerCase())) {
                toast.error('Color with this name already exists');
                return;
            }
            setColors([...colors, { ...colorFormData, stock: stockValue }]);
            toast.success('Color added successfully');
        }
        
        setColorFormData({ name: '', code: '#000000', image: '', stock: 0, additionalPrice: 0 });
        if (colorImageInputRef.current) colorImageInputRef.current.value = '';
    };

    const handleEditColor = (index) => {
        setColorFormData(colors[index]);
        setEditingColorIndex(index);
        document.getElementById('color-form-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleDeleteColor = (index) => {
        if (window.confirm('Are you sure you want to delete this color?')) {
            const updatedColors = colors.filter((_, i) => i !== index);
            setColors(updatedColors);
            toast.success('Color deleted successfully');
        }
    };

    const handleColorImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Image size should be less than 2MB');
                return;
            }
            const imageUrl = URL.createObjectURL(file);
            setColorFormData(prev => ({ ...prev, image: imageUrl }));
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { token } = getAuthInfo();
            
            const params = { page, limit: 10, ...(search && { search }) }
            
            if (filter !== 'all') {
                if (filter === 'active') params.active = 'true';
                if (filter === 'inactive') params.active = 'false';
                if (filter === 'featured') params.isFeatured = 'true';
                if (filter === 'trending') params.isTrending = 'true';
                if (filter === 'new') params.isNewArrival = 'true';
                if (filter === 'best-seller') params.isBestSeller = 'true';
                if (filter === 'low-stock') params.stock = 'low';
                if (filter === 'out-of-stock') params.stock = 'out';
            }
            
            const endpoint = isAdmin ? '/admin/products' : '/products';
            const response = await api.get(endpoint, { 
                params,
                headers: isAdmin ? { Authorization: `Bearer ${token}` } : {}
            });
            
            const productsData = response.data.data || [];
            setProducts(productsData);
            setTotalPages(response.data.pagination?.pages || 1);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error(error.response?.data?.error || 'Failed to fetch products');
        } finally {
            setLoading(false);
        }
    }

    // Auto-calculate stock if colors exist
    useEffect(() => {
        if (colors.length > 0) {
            const totalStock = colors.reduce((sum, color) => sum + (parseInt(color.stock) || 0), 0);
            setFormData(prev => ({ ...prev, stock: totalStock }));
        }
    }, [colors]);

    const getImageUrl = (image) => {
        if (!image) return getFallbackImage();
        if (image.url && (image.url.startsWith('http://') || image.url.startsWith('https://'))) return image.url;
        if (image.public_id && image.url && image.url.includes('cloudinary')) return image.url;
        if (image.url && image.url.startsWith('data:')) return image.url;
        if (image.url) {
            const imagePath = image.url.startsWith('/') ? image.url.substring(1) : image.url;
            return `${BASE_URL}/${imagePath}`;
        }
        if (image.public_id) return `${BASE_URL}/uploads/products/${image.public_id}`;
        return getFallbackImage();
    };

    const handleImageError = (e) => {
        e.target.src = getFallbackImage();
        e.target.onerror = null;
    }

    const handleLocalImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + selectedImages.length > 20) {
            toast.error('Maximum 20 images allowed');
            return;
        }
        const newImages = files.map(file => ({
            file,
            filename: file.name,
            url: URL.createObjectURL(file),
            isDefault: selectedImages.length === 0
        }));
        setSelectedImages(prev => [...prev, ...newImages]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    const removeImage = (index) => {
        const newImages = [...selectedImages];
        const removedImage = newImages[index];
        if (removedImage.url && removedImage.url.startsWith('blob:')) URL.revokeObjectURL(removedImage.url);
        newImages.splice(index, 1);
        setSelectedImages(newImages);
        if (removedImage.isDefault && newImages.length > 0) setDefaultImage(0);
        if (editingProduct && removedImage.filename && !removedImage.file) {
            setDeletedImages(prev => [...prev, removedImage.filename]);
        }
    }

    const setDefaultImage = (index) => {
        const newImages = selectedImages.map((img, i) => ({ ...img, isDefault: i === index }));
        setSelectedImages(newImages);
    }

    const resetForm = () => {
        setFormData({
            name: '', description: '', shortDescription: '', price: '', discountPrice: '',
            mainCategory: '', category: '', subCategory: '', stock: '', tags: '',
            isFeatured: false, isTrending: false, isNewArrival: false, isBestSeller: false, isActive: true
        });
        setColors([]);
        setEditingColorIndex(null);
        setColorFormData({ name: '', code: '#000000', image: '', stock: 0, additionalPrice: 0 });
        selectedImages.forEach(img => { if (img.url && img.url.startsWith('blob:')) URL.revokeObjectURL(img.url); });
        setSelectedImages([]);
        setDeletedImages([]);
        setEditingProduct(null);
        setSubCategories([]);
    }

    const getMainCategoryName = (product) => {
        if (!product) return 'Uncategorized';
        if (product.mainCategory && typeof product.mainCategory === 'object' && product.mainCategory.name) return product.mainCategory.name;
        if (product.mainCategoryInfo && product.mainCategoryInfo.name) return product.mainCategoryInfo.name;
        if (product.mainCategory && typeof product.mainCategory === 'string') {
            const mainCat = mainCategories.find(mc => mc._id === product.mainCategory);
            return mainCat ? mainCat.name : 'Uncategorized';
        }
        return 'Uncategorized';
    }

    const getPopularCategoryName = (product) => {
        if (!product) return 'Uncategorized';
        if (product.category && typeof product.category === 'object' && product.category.name) return product.category.name;
        if (product.categoryInfo && product.categoryInfo.name) return product.categoryInfo.name;
        if (product.category && typeof product.category === 'string') {
            const popCat = popularCategories.find(pc => pc._id === product.category);
            return popCat ? popCat.name : 'Uncategorized';
        }
        return 'Uncategorized';
    }

    const openEditModal = async (product) => {
        const { token, user } = getAuthInfo();
        if (!token || user?.role !== 'admin') { toast.error('Admin access required'); return; }

        setEditingProduct(product);
        
        let mainCategoryId = '';
        if (product.mainCategory) {
            mainCategoryId = typeof product.mainCategory === 'object' ? product.mainCategory._id : product.mainCategory;
        }
        
        let categoryId = '';
        if (product.category) {
            categoryId = typeof product.category === 'object' ? product.category._id : product.category;
        }
        
        setFormData({
            name: product.name || '',
            description: product.description || '',
            shortDescription: product.shortDescription || '',
            price: product.price || '',
            discountPrice: product.discountPrice || '',
            mainCategory: mainCategoryId,
            category: categoryId,
            subCategory: product.subCategory || '',
            stock: product.stock || '',
            tags: product.tags?.join(', ') || '',
            isFeatured: product.isFeatured || false,
            isTrending: product.isTrending || false,
            isNewArrival: product.isNewArrival || false,
            isBestSeller: product.isBestSeller || false,
            isActive: product.isActive !== false
        });
        
        setColors(product.colors || []);
        
        if (categoryId) {
            const selectedCategory = popularCategories.find(cat => cat._id === categoryId);
            if (selectedCategory && selectedCategory.subCategories) setSubCategories(selectedCategory.subCategories);
        }
        
        const productImages = product.images?.map((img, index) => ({
            filename: img.public_id || img.filename,
            url: getImageUrl(img),
            isDefault: index === 0,
            file: null
        })) || [];
        
        setSelectedImages(productImages);
        setShowModal(true);
    }

    const handleDelete = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            const { token, user } = getAuthInfo();
            if (!token || user?.role !== 'admin') { toast.error('Admin access required'); return; }
            await api.delete(`/admin/products/${productId}`, { headers: { Authorization: `Bearer ${token}` } });
            toast.success('Product deleted successfully');
            fetchProducts();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to delete product');
        }
    }

    const handleToggleStatus = async (productId, type) => {
        try {
            const { token, user } = getAuthInfo();
            if (!token || user?.role !== 'admin') { toast.error('Admin access required'); return; }
            const endpoints = {
                active: `/admin/products/${productId}/toggle-active`,
                featured: `/admin/products/${productId}/toggle-featured`,
                trending: `/admin/products/${productId}/toggle-trending`,
                newArrival: `/admin/products/${productId}/toggle-new-arrival`,
                bestSeller: `/admin/products/${productId}/toggle-best-seller`
            };
            await api.put(endpoints[type], {}, { headers: { Authorization: `Bearer ${token}` } });
            toast.success('Product status updated');
            fetchProducts();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update product status');
        }
    }

    // ✅ FIXED handleSubmit: all text fields appended BEFORE image files
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        console.log('=== SUBMITTING PRODUCT ===');
        console.log('Form Data:', formData);
        
        const errors = [];
        
        if (!formData.name?.trim()) errors.push('Product name is required');
        if (!formData.description?.trim()) errors.push('Description is required');
        if (!formData.price || parseFloat(formData.price) <= 0) errors.push('Valid price is required');
        
        const mainCategoryValue = formData.mainCategory;
        const categoryValue = formData.category;
        
        if (!mainCategoryValue || mainCategoryValue === '' || mainCategoryValue === 'undefined') {
            errors.push('Main Category is required');
            toast.error('Please select a Main Category from the dropdown');
        }
        
        if (!categoryValue || categoryValue === '' || categoryValue === 'undefined') {
            errors.push('Popular Category is required');
            toast.error('Please select a Popular Category from the dropdown');
        }
        
        if (!formData.stock || parseInt(formData.stock) < 0) errors.push('Valid stock quantity is required');
        if (selectedImages.length === 0) errors.push('At least one image is required');
        
        if (formData.discountPrice && parseFloat(formData.discountPrice) > parseFloat(formData.price)) {
            errors.push('Discount price cannot be higher than regular price');
        }
        
        if (errors.length > 0) {
            errors.forEach(error => toast.error(error));
            return;
        }

        const { token, user } = getAuthInfo();
        if (!token || user?.role !== 'admin') { toast.error('Admin access required'); return; }

        setUploading(true);

        try {
            const productFormData = new FormData();
            
            // ✅ CRITICAL FIX: Append ALL text fields FIRST, before any file fields.
            // multer parses multipart data sequentially. If a file field appears before
            // a text field, req.body may not contain the later text fields reliably.
            productFormData.append('name', formData.name.trim());
            productFormData.append('description', formData.description.trim());
            productFormData.append('mainCategory', mainCategoryValue);
            productFormData.append('category', categoryValue);
            productFormData.append('price', formData.price);
            productFormData.append('stock', formData.stock);
            
            // Colors as JSON string
            productFormData.append('colors', colors.length > 0 ? JSON.stringify(colors) : '[]');
            
            // Optional text fields
            if (formData.shortDescription?.trim()) {
                productFormData.append('shortDescription', formData.shortDescription.trim());
            }
            if (formData.discountPrice && parseFloat(formData.discountPrice) > 0) {
                productFormData.append('discountPrice', formData.discountPrice);
            }
            if (formData.subCategory?.trim()) {
                productFormData.append('subCategory', formData.subCategory.trim());
            }
            
            // Tags
            const tagsArray = formData.tags
                ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
                : [];
            productFormData.append('tags', JSON.stringify(tagsArray));
            
            // Boolean fields
            productFormData.append('isFeatured', formData.isFeatured ? 'true' : 'false');
            productFormData.append('isTrending', formData.isTrending ? 'true' : 'false');
            productFormData.append('isNewArrival', formData.isNewArrival ? 'true' : 'false');
            productFormData.append('isBestSeller', formData.isBestSeller ? 'true' : 'false');
            productFormData.append('isActive', formData.isActive ? 'true' : 'false');
            
            // Edit-specific fields
            if (editingProduct && deletedImages.length > 0) {
                productFormData.append('deletedImages', JSON.stringify(deletedImages));
            }
            if (editingProduct) {
                const defaultImage = selectedImages.find(img => img.isDefault);
                if (defaultImage?.filename && !defaultImage.file) {
                    productFormData.append('defaultImage', defaultImage.filename);
                }
            }

            // ✅ Images LAST — always append file fields after all text fields
            const imageFiles = selectedImages.filter(img => img.file);
            imageFiles.forEach(img => productFormData.append('images', img.file));
            
            console.log(`Appending ${imageFiles.length} new image files`);
            console.log('FormData entries being sent:');
            for (let pair of productFormData.entries()) {
                if (pair[0] !== 'images') {
                    console.log(pair[0], pair[1]);
                } else {
                    console.log(pair[0], '[FILE]', pair[1].name);
                }
            }

            const headers = { Authorization: `Bearer ${token}` };
            // Do NOT set Content-Type — let the browser set it with the multipart boundary

            let response;
            if (editingProduct) {
                console.log('Updating product:', editingProduct._id);
                response = await api.put(`/admin/products/${editingProduct._id}`, productFormData, { headers });
                toast.success('Product updated successfully');
            } else {
                console.log('Creating new product');
                response = await api.post('/admin/products', productFormData, { headers });
                toast.success('Product created successfully');
            }
            
            console.log('Response:', response.data);
            setShowModal(false);
            resetForm();
            fetchProducts();
        } catch (error) {
            console.error('Save error:', error);
            console.error('Error response:', error.response?.data);
            const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to save product';
            toast.error(`Error: ${errorMessage}`);
        } finally {
            setUploading(false);
        }
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 2
        }).format(amount);
    };

    const getTotalColorStock = () => colors.reduce((total, color) => total + (color.stock || 0), 0);

    useEffect(() => {
        return () => {
            selectedImages.forEach(img => { if (img.url && img.url.startsWith('blob:')) URL.revokeObjectURL(img.url); });
        };
    }, [selectedImages]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Product Management</h2>
                    <p className="text-gray-600 mt-1">Manage your products with colors and categories</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex items-center gap-2"
                    >
                        <FaPlus />
                        <span>Add Product</span>
                    </button>
                )}
            </div>

            {/* Category Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                            <FaLayerGroup className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800">Main Categories</h3>
                            <p className="text-sm text-gray-600">{mainCategories.length} categories available</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                            <FaList className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800">Popular Categories</h3>
                            <p className="text-sm text-gray-600">{popularCategories.length} categories available</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-4 border border-pink-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1">
                        <FaSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search products by name, SKU, or category..."
                            className="w-full pl-10 pr-4 py-3 border-2 border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-500 transition-all"
                        />
                    </div>
                    {isAdmin && (
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="border-2 border-pink-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-500 transition-all"
                        >
                            <option value="all">All Products</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="featured">Featured</option>
                            <option value="trending">🔥 Popular Picks</option>
                            <option value="new">✨ New Arrivals</option>
                            <option value="best-seller">🏆 Best Sellers</option>
                            <option value="low-stock">Low Stock</option>
                            <option value="out-of-stock">Out of Stock</option>
                        </select>
                    )}
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-pink-100">
                {loading ? (
                    <div className="p-12 text-center">
                        <FaSpinner className="animate-spin h-10 w-10 mx-auto text-pink-500" />
                        <p className="mt-4 text-gray-600">Loading products...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <FaBoxOpen className="w-20 h-20 mx-auto mb-4 text-pink-300" />
                        <p className="text-lg font-medium text-gray-700 mb-2">No products found</p>
                        <p className="text-gray-600 mb-6">Add some products to get started!</p>
                        {search && (
                            <button onClick={() => setSearch('')} className="text-pink-600 hover:text-pink-700 font-medium">
                                Clear search
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-pink-50 to-purple-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">Product</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">Main Category</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">Popular Category</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">Colors</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">Price</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">Stock</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">Display Sections</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">Status</th>
                                    {isAdmin && <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-pink-100">
                                {products.map((product) => (
                                    <tr key={product._id} className="hover:bg-pink-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div 
                                                className="flex items-center cursor-pointer group"
                                                onClick={() => navigate(`/admin/products/details/${product._id}`)}
                                                title="View Product Details"
                                            >
                                                <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg overflow-hidden flex-shrink-0 border border-pink-200 group-hover:border-pink-400 transition-colors">
                                                    <img src={getImageUrl(product.images?.[0])} alt={product.name} className="w-full h-full object-cover" onError={handleImageError} />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="font-bold text-gray-900 line-clamp-1 group-hover:text-pink-600 transition-colors">{product.name}</div>
                                                    <div className="text-xs text-gray-500">{product.sku || 'No SKU'}</div>
                                                    <div className="flex items-center mt-1">
                                                        <FaStar className="text-yellow-400 text-xs mr-1" />
                                                        <span className="text-xs text-gray-500">{product.ratings?.average?.toFixed(1) || '0.0'} ({product.ratings?.count || 0})</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <FaLayerGroup className="text-purple-500 mr-2" />
                                                <span className="text-sm font-medium text-gray-800">{getMainCategoryName(product)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <FaFolder className="text-pink-500 mr-2" />
                                                <div>
                                                    <div className="text-sm text-gray-800 font-medium">{getPopularCategoryName(product)}</div>
                                                    {product.subCategory && <div className="text-xs text-gray-500">{product.subCategory}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {product.colors && product.colors.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {product.colors.slice(0, 3).map((color, idx) => (
                                                        <div key={idx} className="w-6 h-6 rounded-full border border-gray-300" style={{ backgroundColor: color.code }} title={`${color.name} (Stock: ${color.stock})`}></div>
                                                    ))}
                                                    {product.colors.length > 3 && <span className="text-xs text-gray-500 ml-1">+{product.colors.length - 3}</span>}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400">No colors</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">{formatCurrency(product.price)}</div>
                                            {product.discountPrice > 0 && <div className="text-xs text-gray-500 line-through">{formatCurrency(product.discountPrice)}</div>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`font-bold ${(product.colors?.reduce((sum, c) => sum + c.stock, 0) || product.stock) > 10 ? 'text-green-600' : (product.colors?.reduce((sum, c) => sum + c.stock, 0) || product.stock) > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                {product.colors?.length > 0 ? `${product.colors.reduce((sum, c) => sum + c.stock, 0)} units (${product.colors.length} colors)` : `${product.stock} units`}
                                            </div>
                                            <div className="text-xs text-gray-500">Sold: {product.sold || 0}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <button onClick={() => isAdmin && handleToggleStatus(product._id, 'trending')} disabled={!isAdmin} className={`px-2 py-1 text-[10px] font-bold rounded-full flex items-center justify-between w-full transition-all border ${product.isTrending ? 'bg-orange-100 text-orange-800 border-orange-300' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                                                    <div className="flex items-center gap-1"><FaFire /><span>Popular Picks</span></div>
                                                    {product.isTrending && <FaCheck className="text-[8px]" />}
                                                </button>
                                                <button onClick={() => isAdmin && handleToggleStatus(product._id, 'newArrival')} disabled={!isAdmin} className={`px-2 py-1 text-[10px] font-bold rounded-full flex items-center justify-between w-full transition-all border ${product.isNewArrival ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                                                    <div className="flex items-center gap-1"><FaRocket /><span>New Arrivals</span></div>
                                                    {product.isNewArrival && <FaCheck className="text-[8px]" />}
                                                </button>
                                                <button onClick={() => isAdmin && handleToggleStatus(product._id, 'bestSeller')} disabled={!isAdmin} className={`px-2 py-1 text-[10px] font-bold rounded-full flex items-center justify-between w-full transition-all border ${product.isBestSeller ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                                                    <div className="flex items-center gap-1"><FaChartLine /><span>Best Sellers</span></div>
                                                    {product.isBestSeller && <FaCheck className="text-[8px]" />}
                                                </button>
                                                <button onClick={() => isAdmin && handleToggleStatus(product._id, 'featured')} disabled={!isAdmin} className={`px-2 py-1 text-[10px] font-bold rounded-full flex items-center justify-between w-full transition-all border ${product.isFeatured ? 'bg-purple-100 text-purple-800 border-purple-300' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                                                    <div className="flex items-center gap-1"><FaStar /><span>Featured</span></div>
                                                    {product.isFeatured && <FaCheck className="text-[8px]" />}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                {isAdmin ? (
                                                    <button onClick={() => handleToggleStatus(product._id, 'active')} className={`px-3 py-1 text-xs rounded-full flex items-center gap-2 transition-all ${product.isActive ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}>
                                                        {product.isActive ? <FaToggleOn /> : <FaToggleOff />}
                                                        <span>{product.isActive ? 'Active' : 'Inactive'}</span>
                                                    </button>
                                                ) : (
                                                    <span className={`px-3 py-1 text-xs rounded-full ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{product.isActive ? 'Active' : 'Inactive'}</span>
                                                )}
                                            </div>
                                        </td>
                                        {isAdmin && (
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <button onClick={() => window.open(`/product/${product.slug}`, '_blank')} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="View in Store"><FaEye /></button>
                                                    <button onClick={() => navigate(`/admin/products/details/${product._id}`)} className="p-2 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors" title="View Details"><FaInfoCircle /></button>
                                                    <button onClick={() => openEditModal(product)} className="p-2 bg-pink-50 text-pink-600 hover:bg-pink-100 rounded-lg transition-colors" title="Edit"><FaEdit /></button>
                                                    <button onClick={() => handleDelete(product._id)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Delete"><FaTrash /></button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4">
                    <button onClick={() => setPage(prev => Math.max(1, prev - 1))} disabled={page === 1} className="px-6 py-2 border-2 border-pink-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-pink-50 transition-colors">Previous</button>
                    <span className="text-sm font-medium">Page {page} of {totalPages}</span>
                    <button onClick={() => setPage(prev => Math.min(totalPages, prev + 1))} disabled={page === totalPages} className="px-6 py-2 border-2 border-pink-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-pink-50 transition-colors">Next</button>
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && isAdmin && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                                    <p className="text-gray-600 mt-1">{editingProduct ? 'Update product details' : 'Fill in the details for your new product'}</p>
                                    <p className="text-sm text-red-500 mt-2">* Required fields must be filled</p>
                                </div>
                                <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600 text-xl"><FaTimes /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-3">Product Name *</label>
                                        <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-500 transition-all" placeholder="Enter product name" />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-3">Main Category *</label>
                                        <select required value={formData.mainCategory} onChange={handleMainCategoryChange} className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-500 transition-all">
                                            <option value="">-- Select Main Category * --</option>
                                            {mainCategories.map(mainCat => (
                                                <option key={mainCat._id} value={mainCat._id}>{mainCat.icon || '📁'} {mainCat.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-3">Popular Category *</label>
                                        <select required value={formData.category} onChange={handleCategoryChange} className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-500 transition-all">
                                            <option value="">-- Select Popular Category * --</option>
                                            {popularCategories.map(category => (
                                                <option key={category._id} value={category._id}>{category.icon} {category.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {subCategories.length > 0 && (
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-3">Sub Category (Optional)</label>
                                            <select value={formData.subCategory} onChange={(e) => setFormData({...formData, subCategory: e.target.value})} className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-500 transition-all">
                                                <option value="">Select Sub Category</option>
                                                {subCategories.map(subCat => (
                                                    <option key={subCat._id} value={subCat.name}>{subCat.icon} {subCat.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-3">Price (₹) *</label>
                                        <input type="number" required min="0" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-500 transition-all" placeholder="Enter price" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-3">Base Stock Quantity *</label>
                                        <input type="number" required min="0" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-500 transition-all" placeholder="Enter base stock quantity" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-3">Discount Price (₹)</label>
                                        <input type="number" min="0" step="0.01" value={formData.discountPrice} onChange={(e) => setFormData({...formData, discountPrice: e.target.value})} className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-500 transition-all" placeholder="Optional discount price" />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-3">Tags (comma separated)</label>
                                        <input type="text" value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} placeholder="e.g., premium, popular, exclusive" className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-500 transition-all" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">Description *</label>
                                    <textarea required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows="4" className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-500 transition-all" placeholder="Enter detailed product description"></textarea>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3">Short Description</label>
                                    <textarea value={formData.shortDescription} onChange={(e) => setFormData({...formData, shortDescription: e.target.value})} rows="2" className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-500 transition-all" placeholder="Brief description (optional)"></textarea>
                                </div>

                                {/* Colors Section */}
                                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-2xl border-2 border-indigo-200">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-lg font-bold text-gray-800 flex items-center"><FaPalette className="mr-2 text-indigo-500" />Product Colors & Variants</h4>
                                        <span className="text-sm text-gray-600">Total Color Stock: {getTotalColorStock()} units</span>
                                    </div>
                                    
                                    <div id="color-form-section" className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4 items-end">
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Color Name</label>
                                            <input type="text" placeholder="e.g., Sky Blue" value={colorFormData.name} onChange={(e) => setColorFormData({...colorFormData, name: e.target.value})} className="w-full px-4 py-2 border-2 border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Color Code</label>
                                            <input type="color" value={colorFormData.code} onChange={(e) => setColorFormData({...colorFormData, code: e.target.value})} className="w-full h-10 border-2 border-indigo-200 rounded-xl cursor-pointer" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Stock *</label>
                                            <input type="number" placeholder="Stock" value={colorFormData.stock} onChange={(e) => setColorFormData({...colorFormData, stock: e.target.value})} className="w-full px-4 py-2 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 outline-none" />
                                        </div>
                                        <div className="relative">
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Variant Image</label>
                                            <input type="file" ref={colorImageInputRef} className="hidden" accept="image/*" onChange={handleColorImageUpload} id="color-image-input" />
                                            <div className="flex gap-2">
                                                <button type="button" onClick={() => colorImageInputRef.current?.click()} className="flex-1 bg-white border-2 border-dashed border-indigo-300 hover:border-indigo-500 text-indigo-500 h-10 rounded-xl flex items-center justify-center transition-all">
                                                    {colorFormData.image ? <FaCheck className="text-green-500" /> : <FaImage />}
                                                </button>
                                                {colorFormData.image && (
                                                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-indigo-200">
                                                        <img src={colorFormData.image} className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <button type="button" onClick={handleAddColor} className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white h-10 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                                                {editingColorIndex !== null ? <FaSave /> : <FaPlus />}
                                                <span>{editingColorIndex !== null ? 'Update' : 'Add'}</span>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {colors.length > 0 && (
                                        <div className="mt-4">
                                            <h5 className="font-semibold text-gray-700 mb-3">Available Colors ({colors.length})</h5>
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-60 overflow-y-auto p-2">
                                                {colors.map((color, index) => (
                                                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-xl border border-indigo-200">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full border-2 border-gray-300" style={{ backgroundColor: color.code }}></div>
                                                            <div>
                                                                <div className="font-semibold text-gray-800">{color.name}</div>
                                                                <div className="text-xs text-gray-500">Stock: {color.stock} | Extra: ₹{color.additionalPrice}</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button type="button" onClick={() => handleEditColor(index)} className="text-blue-500 hover:text-blue-700 p-1 rounded"><FaEdit /></button>
                                                            <button type="button" onClick={() => handleDeleteColor(index)} className="text-red-500 hover:text-red-700 p-1 rounded"><FaTrash /></button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Product Images Section */}
                                <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-2xl border-2 border-pink-200">
                                    <label className="block text-sm font-bold text-gray-700 mb-4">Product Images * ({selectedImages.length}/20)</label>
                                    <div className="mb-6">
                                        <input type="file" ref={fileInputRef} multiple accept="image/*" onChange={handleLocalImageUpload} className="hidden" id="image-upload" disabled={uploading} />
                                        <label htmlFor="image-upload" className={`inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-bold hover:from-pink-600 hover:to-purple-600 transition-all duration-300 hover:shadow-lg cursor-pointer ${selectedImages.length >= 20 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                            <FaUpload className="mr-3" />Select Images
                                        </label>
                                    </div>
                                    {selectedImages.length > 0 && (
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                            {selectedImages.map((img, index) => (
                                                <div key={index} className="relative group">
                                                    <div className="aspect-square overflow-hidden rounded-xl bg-white border-2 border-pink-200">
                                                        <img src={img.url} alt={`Product ${index + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" onError={handleImageError} />
                                                    </div>
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all rounded-xl flex items-center justify-center gap-3">
                                                        <button type="button" onClick={() => removeImage(index)} className="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all"><FaTimes /></button>
                                                        <button type="button" onClick={() => setDefaultImage(index)} className={`opacity-0 group-hover:opacity-100 p-2 rounded-full transition-all ${img.isDefault ? 'bg-green-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}><FaCheck /></button>
                                                    </div>
                                                    {img.isDefault && <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider">Cover Image</div>}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Display Sections */}
                                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-2xl border-2 border-yellow-200">
                                    <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><FaTag className="mr-2 text-orange-500" />Display Sections (Home Page)</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div className="flex items-center p-4 bg-white rounded-xl border-2 border-orange-200">
                                            <input type="checkbox" id="isTrending" checked={formData.isTrending} onChange={(e) => setFormData({...formData, isTrending: e.target.checked})} className="h-5 w-5 text-orange-600 rounded" />
                                            <label htmlFor="isTrending" className="ml-4 cursor-pointer">
                                                <div className="font-bold text-gray-800 flex items-center"><FaFire className="text-orange-500 mr-2" />Today's Popular Picks</div>
                                            </label>
                                        </div>
                                        <div className="flex items-center p-4 bg-white rounded-xl border-2 border-blue-200">
                                            <input type="checkbox" id="isNewArrival" checked={formData.isNewArrival} onChange={(e) => setFormData({...formData, isNewArrival: e.target.checked})} className="h-5 w-5 text-blue-600 rounded" />
                                            <label htmlFor="isNewArrival" className="ml-4 cursor-pointer">
                                                <div className="font-bold text-gray-800 flex items-center"><FaRocket className="text-blue-500 mr-2" />New Arrivals</div>
                                            </label>
                                        </div>
                                        <div className="flex items-center p-4 bg-white rounded-xl border-2 border-yellow-200">
                                            <input type="checkbox" id="isBestSeller" checked={formData.isBestSeller} onChange={(e) => setFormData({...formData, isBestSeller: e.target.checked})} className="h-5 w-5 text-yellow-600 rounded" />
                                            <label htmlFor="isBestSeller" className="ml-4 cursor-pointer">
                                                <div className="font-bold text-gray-800 flex items-center"><FaChartLine className="text-yellow-500 mr-2" />Best Sellers</div>
                                            </label>
                                        </div>
                                        <div className="flex items-center p-4 bg-white rounded-xl border-2 border-purple-200">
                                            <input type="checkbox" id="isFeatured" checked={formData.isFeatured} onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})} className="h-5 w-5 text-purple-600 rounded" />
                                            <label htmlFor="isFeatured" className="ml-4 cursor-pointer">
                                                <div className="font-bold text-gray-800 flex items-center"><FaStar className="text-purple-500 mr-2" />Featured Product</div>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center p-4 border-2 border-green-200 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50">
                                    <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} className="h-5 w-5 text-green-600 rounded" />
                                    <label htmlFor="isActive" className="ml-4 cursor-pointer">
                                        <div className="font-bold text-gray-800">Active Product</div>
                                        <div className="text-sm text-gray-600">Make product visible to customers</div>
                                    </label>
                                </div>

                                <div className="flex justify-end gap-4 pt-8 border-t border-pink-200">
                                    <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="px-8 py-3 border-2 border-pink-300 text-pink-600 hover:bg-pink-50 rounded-xl font-bold transition-all">Cancel</button>
                                    <button type="submit" disabled={uploading} className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-2">
                                        {uploading ? (<><FaSpinner className="animate-spin" />Saving...</>) : editingProduct ? 'Update Product' : 'Create Product'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProductManager