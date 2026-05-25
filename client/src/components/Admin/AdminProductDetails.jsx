import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaBox,
  FaTag,
  FaStar,
  FaFire,
  FaCalendarAlt,
  FaEdit,
  FaTrash,
  FaEye,
  FaImage,
  FaDollarSign,
  FaWarehouse,
  FaWeight,
  FaRulerCombined,
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
  FaShoppingCart,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import { api } from "../../services/api";

const AdminProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [imageErrors, setImageErrors] = useState({});

  const getAuthInfo = () => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    const user = JSON.parse(
      localStorage.getItem("user") || sessionStorage.getItem("user") || "{}"
    );
    return { token, user };
  };

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const { token, user } = getAuthInfo();

      if (!token || user?.role !== "admin") {
        toast.error("Admin access required");
        navigate("/admin/products");
        return;
      }

      const response = await api.get(`/admin/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProduct(response.data.data.product);
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error(
        error.response?.data?.error || "Failed to fetch product details"
      );
      navigate("/admin/products");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getStockStatus = (stock) => {
    if (stock > 20)
      return { text: "In Stock", color: "text-green-600", bg: "bg-green-100" };
    if (stock > 0)
      return {
        text: "Low Stock",
        color: "text-yellow-600",
        bg: "bg-yellow-100",
      };
    return { text: "Out of Stock", color: "text-red-600", bg: "bg-red-100" };
  };

  const getStatusBadge = (status) => {
    const config = {
      true: { text: "Active", color: "text-green-800", bg: "bg-green-100" },
      false: { text: "Inactive", color: "text-red-800", bg: "bg-red-100" },
    };
    return config[status];
  };

  const getBackendUrl = () => {
    const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5001/api';
    const BASE_URL = API_URL.replace(/\/api$/, '');
    return BASE_URL;
  };

  const getImageUrl = (image) => {
    if (!image) {
      return "https://via.placeholder.com/400?text=No+Image";
    }

    const BASE_URL = getBackendUrl();
    
    if (typeof image === 'string') {
      if (image.startsWith('http://') || image.startsWith('https://')) {
        return image;
      }
      if (image.startsWith('/')) {
        return `${BASE_URL}${image}`;
      }
      return `${BASE_URL}/uploads/products/${image}`;
    }

    if (image && typeof image === 'object') {
      if (image.url) {
        const url = image.url;
        
        if (url.startsWith('http://') || url.startsWith('https://')) {
          return url;
        }
        
        if (image.public_id && url && url.includes('cloudinary')) {
          return url;
        }
        
        if (url.startsWith('data:')) {
          return url;
        }
        
        const imagePath = url.startsWith('/') ? url : `/${url}`;
        const fullUrl = `${BASE_URL}${imagePath}`;
        return fullUrl;
      }
      
      if (image.public_id) {
        return `${BASE_URL}/uploads/products/${image.public_id}`;
      }
      
      if (image.filename) {
        return `${BASE_URL}/uploads/products/${image.filename}`;
      }
    }

    return "https://images.unsplash.com/photo-1550747535-6734fa2e5f6b?w=400&h=400&fit=crop&q=80";
  };

  const handleImageError = (imageId, img, e) => {
    console.error(`Failed to load image ${imageId}:`, img);
    console.error("Image URL attempted:", e.target.src);
    
    setImageErrors(prev => ({
      ...prev,
      [imageId]: true
    }));
  };

  const getFallbackImage = () => {
    return "https://images.unsplash.com/photo-1550747535-6734fa2e5f6b?w=400&h=400&fit=crop&q=80";
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const { token } = getAuthInfo();
      await api.delete(`/admin/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Product deleted successfully");
      navigate("/admin/products");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete product");
    }
  };

  const handleToggleStatus = async (type) => {
    try {
      const { token } = getAuthInfo();
      const endpoints = {
        active: `/admin/products/${id}/toggle-active`,
        featured: `/admin/products/${id}/toggle-featured`,
        trending: `/admin/products/${id}/toggle-trending`,
        newArrival: `/admin/products/${id}/toggle-new-arrival`,
      };

      await api.put(
        endpoints[type],
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Product status updated");
      fetchProductDetails();
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Failed to update product status"
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-4 mb-6">
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-gray-200 rounded animate-pulse"
                ></div>
              ))}
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 bg-gray-200 rounded animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Product Not Found
            </h3>
            <p className="text-gray-500 mb-6">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => navigate("/admin/products")}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <FaArrowLeft />
              <span>Back to Products</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus(product.stock);
  const activeStatus = getStatusBadge(product.isActive);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate("/admin/products")}
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <FaArrowLeft />
            <span>Back to Products</span>
          </button>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {product.name}
              </h1>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-sm text-gray-500">
                  SKU: {product.sku}
                </span>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${activeStatus.bg} ${activeStatus.color}`}
                >
                  {activeStatus.text}
                </span>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${stockStatus.bg} ${stockStatus.color}`}
                >
                  {stockStatus.text}
                </span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => window.open(`/product/${product._id}`, "_blank")}
                className="btn-outline flex items-center space-x-2"
              >
                <FaEye />
                <span>View Live</span>
              </button>
              <button
                onClick={() => {
                  localStorage.setItem('editProductId', product._id);
                  navigate('/admin/products');
                }}
                className="btn-primary flex items-center space-x-2"
              >
                <FaEdit />
                <span>Edit Product</span>
              </button>
              <button
                onClick={handleDelete}
                className="btn-danger flex items-center space-x-2"
              >
                <FaTrash />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Product Images
                </h2>
                <span className="text-sm text-gray-500">
                  {product.images?.length || 0} images
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {product.images?.length > 0 ? (
                  product.images.map((img, index) => {
                    const imageUrl = getImageUrl(img);
                    const hasError = imageErrors[img._id || index];
                    
                    return (
                      <div key={img._id || index} className="relative group">
                        <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                          <img
                            src={hasError ? getFallbackImage() : imageUrl}
                            alt={img.alt || `Product image ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                            onError={(e) => handleImageError(img._id || index, img, e)}
                            loading="lazy"
                          />
                        </div>
                        {img.isDefault && (
                          <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                            Cover Image
                          </div>
                        )}
                        {hasError && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            Error
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg"></div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full text-center py-8">
                    <FaImage className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">No images available</p>
                  </div>
                )}
              </div>
              {Object.keys(imageErrors).length > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-700">
                    ⚠️ Some images failed to load. Check console for details.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="border-b">
                <nav className="flex -mb-px overflow-x-auto">
                  <button
                    onClick={() => setActiveTab("details")}
                    className={`py-4 px-6 text-sm font-medium whitespace-nowrap ${
                      activeTab === "details"
                        ? "border-b-2 border-blue-500 text-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Product Details
                  </button>
                  <button
                    onClick={() => setActiveTab("reviews")}
                    className={`py-4 px-6 text-sm font-medium whitespace-nowrap ${
                      activeTab === "reviews"
                        ? "border-b-2 border-blue-500 text-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Reviews ({product.reviews?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className={`py-4 px-6 text-sm font-medium whitespace-nowrap ${
                      activeTab === "orders"
                        ? "border-b-2 border-blue-500 text-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Orders ({product.orders?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab("specifications")}
                    className={`py-4 px-6 text-sm font-medium whitespace-nowrap ${
                      activeTab === "specifications"
                        ? "border-b-2 border-blue-500 text-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Specifications
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {activeTab === "details" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">
                        Description
                      </h3>
                      <p className="text-gray-700 whitespace-pre-line">
                        {product.description}
                      </p>
                    </div>

                    {product.shortDescription && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">
                          Short Description
                        </h3>
                        <p className="text-gray-700">
                          {product.shortDescription}
                        </p>
                      </div>
                    )}

                    {product.tags && product.tags.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">
                          Tags
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {product.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                            >
                              <FaTag className="mr-1" size={12} />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "specifications" && (
                  <div>
                    {product.specifications &&
                    Object.keys(product.specifications).length > 0 ? (
                      <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(product.specifications).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className="bg-gray-50 p-4 rounded-lg"
                            >
                              <dt className="text-sm font-medium text-gray-500 mb-1">
                                {key}
                              </dt>
                              <dd className="text-gray-900">
                                {value || "Not specified"}
                              </dd>
                            </div>
                          )
                        )}
                      </dl>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <FaInfoCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No specifications available</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div className="space-y-4">
                    {product.reviews?.length > 0 ? (
                      product.reviews.map((review) => (
                        <div
                          key={review._id}
                          className="border-b pb-4 last:border-0"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                {review.user?.avatar ? (
                                  <img
                                    src={getImageUrl(review.user.avatar)}
                                    alt={review.user.name}
                                    className="w-full h-full rounded-full object-cover"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                ) : null}
                                {!review.user?.avatar && (
                                  <span className="text-gray-500 font-medium">
                                    {review.user?.name?.charAt(0).toUpperCase() || 'U'}
                                  </span>
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {review.user?.name || "Anonymous"}
                                </h4>
                                <div className="flex items-center space-x-1">
                                  {[...Array(5)].map((_, i) => (
                                    <FaStar
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < review.rating
                                          ? "text-yellow-400"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                  <span className="text-sm text-gray-500 ml-2">
                                    {review.rating}.0
                                  </span>
                                </div>
                              </div>
                            </div>
                            <span className="text-sm text-gray-500">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                          <p className="mt-3 text-gray-700">{review.comment}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <FaStar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No reviews yet</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "orders" && (
                  <div className="space-y-4">
                    {product.orders?.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Order ID
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Customer
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Quantity
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Total
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Status
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Date
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {product.orders.map((order) => (
                              <tr key={order._id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                  {order.orderId || order._id.slice(-8)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700">
                                  {order.user?.name || "N/A"}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700">
                                  {order.items?.find(
                                    (item) => item.product?._id === product._id
                                  )?.quantity || 1}
                                </td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                  {formatCurrency(
                                    order.priceSummary?.totalPrice || 0
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      order.orderStatus === "delivered"
                                        ? "bg-green-100 text-green-800"
                                        : order.orderStatus === "processing"
                                        ? "bg-blue-100 text-blue-800"
                                        : order.orderStatus === "cancelled"
                                        ? "bg-red-100 text-red-800"
                                        : order.orderStatus === "shipped"
                                        ? "bg-purple-100 text-purple-800"
                                        : "bg-yellow-100 text-yellow-800"
                                    }`}
                                  >
                                    {order.orderStatus
                                      ?.charAt(0)
                                      .toUpperCase() +
                                      order.orderStatus?.slice(1)}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                  {formatDate(order.createdAt)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <FaShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No orders found for this product</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Product Statistics
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Sold</span>
                  <span className="font-semibold">
                    {product.sold || 0} units
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Revenue</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency((product.sold || 0) * product.price)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Views</span>
                  <span className="font-semibold">{product.views || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Rating</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">
                      {product.ratings?.average?.toFixed(1) || 0}
                    </span>
                    <FaStar className="text-yellow-400" />
                    <span className="text-gray-500 text-sm">
                      ({product.ratings?.count || 0})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Product Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <FaDollarSign className="text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Price</div>
                    <div className="font-medium">
                      {formatCurrency(product.price)}
                      {product.discountPrice > 0 && (
                        <span className="ml-2 text-sm text-red-600 line-through">
                          {formatCurrency(product.discountPrice)}
                        </span>
                      )}
                    </div>
                    {product.costPrice > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        Cost: {formatCurrency(product.costPrice)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FaWarehouse className="text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Stock</div>
                    <div className="font-medium">{product.stock} units</div>
                    <div
                      className={`text-xs ${
                        product.stock > 10
                          ? "text-green-600"
                          : product.stock > 0
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {product.stock > 10
                        ? "Good"
                        : product.stock > 0
                        ? "Low"
                        : "Out of stock"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FaBox className="text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Category</div>
                    <div className="font-medium">
                      {typeof product.category === 'object' ? product.category.name : product.category}
                      {product.subCategory && (
                        <span className="block text-sm text-gray-500">
                          Sub: {product.subCategory}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {product.brand && (
                  <div className="flex items-center space-x-3">
                    <FaTag className="text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Brand</div>
                      <div className="font-medium">{product.brand}</div>
                    </div>
                  </div>
                )}

                {product.weight > 0 && (
                  <div className="flex items-center space-x-3">
                    <FaWeight className="text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Weight</div>
                      <div className="font-medium">{product.weight} kg</div>
                    </div>
                  </div>
                )}

                {product.dimensions &&
                  Object.keys(product.dimensions).length > 0 && (
                    <div className="flex items-center space-x-3">
                      <FaRulerCombined className="text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">Dimensions</div>
                        <div className="font-medium">
                          {Object.entries(product.dimensions).map(
                            ([key, value]) => (
                              <span key={key} className="block text-sm">
                                {key}: {value}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Product Status
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active</span>
                  <button
                    onClick={() => handleToggleStatus("active")}
                    className={`flex items-center space-x-2 ${
                      product.isActive
                        ? "text-green-600 hover:text-green-800"
                        : "text-red-600 hover:text-red-800"
                    }`}
                  >
                    {product.isActive ? <FaCheckCircle /> : <FaTimesCircle />}
                    <span className="text-sm">
                      {product.isActive ? "Active" : "Inactive"}
                    </span>
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Featured</span>
                  <button
                    onClick={() => handleToggleStatus("featured")}
                    className={`flex items-center space-x-2 ${
                      product.isFeatured
                        ? "text-green-600 hover:text-green-800"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    {product.isFeatured ? <FaCheckCircle /> : <FaTimesCircle />}
                    <span className="text-sm">
                      {product.isFeatured ? "Yes" : "No"}
                    </span>
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Trending</span>
                  <button
                    onClick={() => handleToggleStatus("trending")}
                    className={`flex items-center space-x-2 ${
                      product.isTrending
                        ? "text-orange-600 hover:text-orange-800"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    {product.isTrending ? <FaFire /> : <FaTimesCircle />}
                    <span className="text-sm">
                      {product.isTrending ? "Yes" : "No"}
                    </span>
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">New Arrival</span>
                  <button
                    onClick={() => handleToggleStatus("newArrival")}
                    className={`flex items-center space-x-2 ${
                      product.isNewArrival
                        ? "text-blue-600 hover:text-blue-800"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    {product.isNewArrival ? (
                      <FaCalendarAlt />
                    ) : (
                      <FaTimesCircle />
                    )}
                    <span className="text-sm">
                      {product.isNewArrival ? "Yes" : "No"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Meta Information
              </h2>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Created:</span>
                  <span>{formatDate(product.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Updated:</span>
                  <span>{formatDate(product.updatedAt)}</span>
                </div>
                {product.createdBy && (
                  <div className="flex justify-between">
                    <span>Created By:</span>
                    <span>{product.createdBy}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Product ID:</span>
                  <span className="font-mono text-xs">{product._id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProductDetails;