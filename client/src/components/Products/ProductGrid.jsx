import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import ProductCard from './ProductsCard';
import { useDailyShuffle } from '../../utils/shuffle';

const ProductGrid = ({ searchQuery, category, sortBy, filters }) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const savedPage = typeof window !== 'undefined' ? sessionStorage.getItem('productGridPage') : null;
  const initialPage = savedPage ? parseInt(savedPage, 10) : 1;
  const [pagination, setPagination] = useState({ total: 0, pages: 0, currentPage: initialPage });
  const shuffledProducts = useDailyShuffle(products);

  useEffect(() => {
    fetchProducts()
  }, [searchQuery, category, sortBy, filters, pagination.currentPage])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      
      let url = '/products?isActive=true'
      
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`
      }
      
      if (category) {
        url += `&category=${category}`
      }
      
      if (sortBy) {
        url += `&sort=${sortBy}`
      }
      
      if (filters?.minPrice) {
        url += `&minPrice=${filters.minPrice}`
      }
      
      if (filters?.maxPrice) {
        url += `&maxPrice=${filters.maxPrice}`
      }
      
      if (filters?.inStock) {
        url += `&inStock=true`
      }
      
      url += `&page=${pagination.currentPage}&limit=30`;
      // Show 30 loading placeholders
      const loadingPlaceholders = [...Array(30)];
      
      const response = await api.get(url)
      
      let productsData = []
      let paginationData = { total: 0, pages: 0, currentPage: 1 }
      
      if (response.data.data) {
        if (Array.isArray(response.data.data)) {
          productsData = response.data.data
        } else if (Array.isArray(response.data.data.products)) {
          productsData = response.data.data.products
        } else if (Array.isArray(response.data.data.data)) {
          productsData = response.data.data.data
        }
      } else if (Array.isArray(response.data)) {
        productsData = response.data
      }
      
      if (response.data.pagination) {
        paginationData = response.data.pagination
      } else if (response.data.data?.pagination) {
        paginationData = response.data.data.pagination
      }
      
      setProducts(productsData)
      setPagination({
        total: paginationData.total || productsData.length,
        pages: paginationData.pages || Math.ceil(productsData.length / 20),
        currentPage: paginationData.currentPage || 1
      })
      
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
    sessionStorage.setItem('productGridPage', newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-xl h-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">No products found</h3>
        <p className="text-gray-600">
          {searchQuery ? `No products matching "${searchQuery}"` : 'No products available at the moment'}
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {shuffledProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
      
      {pagination.pages > 1 && (
        <div className="flex justify-center mt-8 gap-2">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
          >
            Previous
          </button>
          
          {[...Array(Math.min(pagination.pages, 5))].map((_, i) => {
            let pageNum
            if (pagination.pages <= 5) {
              pageNum = i + 1
            } else if (pagination.currentPage <= 3) {
              pageNum = i + 1
            } else if (pagination.currentPage >= pagination.pages - 2) {
              pageNum = pagination.pages - 4 + i
            } else {
              pageNum = pagination.currentPage - 2 + i
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-4 py-2 rounded-lg ${
                  pagination.currentPage === pageNum
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {pageNum}
              </button>
            )
          })}
          
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.pages}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default ProductGrid