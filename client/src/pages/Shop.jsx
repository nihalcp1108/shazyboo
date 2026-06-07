import { useSearchParams } from 'react-router-dom'
import ProductGrid from '../components/Products/ProductGrid'
import { FaSearch, FaHeart, FaMagic } from 'react-icons/fa'

const Shop = () => {
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('search') || ''

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-full px-6 py-3 mb-6 shadow-md border border-white/30">
            <FaSearch className="mr-3 text-xl" style={{ color: 'var(--kiddex-blue)' }} />
            <h2 className="fredoka text-3xl text-gray-800">
              {searchQuery ? 'Search Results' : 'Our Collection'}
            </h2>
          </div>
          
          {searchQuery && (
            <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto border border-white/20">
              <p className="text-lg text-gray-700">
                Searching for <span className="fredoka text-pink-600">"{searchQuery}"</span>
              </p>
            </div>
          )}
        </div>

        <ProductGrid searchQuery={searchQuery} />
      </div>
    </div>
  )
}

export default Shop