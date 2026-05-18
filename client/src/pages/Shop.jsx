import { useSearchParams } from 'react-router-dom'
import ProductGrid from '../components/Products/ProductGrid'
import { FaSearch, FaHeart, FaMagic } from 'react-icons/fa'

const Shop = () => {
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('search') || ''

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-20" style={{ background: 'linear-gradient(135deg, #ef63a4 0%, #f585b9 0%, #e4f1f6 100%)' }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-pink-300/20 -translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-purple-300/20 translate-x-48 translate-y-48"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
            <FaHeart className="text-white mr-2" />
            <span className="text-white font-medium">Discover Amazing Products!</span>
            <FaHeart className="text-white ml-2" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Shop Our Collection ✨
          </h1>
          <p className="text-xl mb-8 text-white/90 max-w-3xl mx-auto">
            {searchQuery 
              ? `Searching for "${searchQuery}"...` 
              : 'Browse our collection of amazing products! Each item is carefully selected for quality and style.'}
          </p>
          
          {!searchQuery && (
            <div className="flex flex-wrap items-center justify-center gap-4 text-lg">
              <div className="flex items-center">
                <FaMagic className="text-yellow-300 mr-2" />
                <span>Handpicked Quality</span>
              </div>
              <div className="flex items-center">
                <FaHeart className="text-pink-200 mr-2" />
                <span>100% Satisfaction Guaranteed</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0H1440V120C1440 120 1152 60 720 60C288 60 0 120 0 120V0Z" fill="#F9FAFB"/>
          </svg>
        </div>
      </section>

      {/* Products */}
      <div className="container mx-auto px-4 py-12">
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