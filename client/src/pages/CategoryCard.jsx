import { Link } from 'react-router-dom';
import { FaArrowRight, FaHeart, FaGift } from 'react-icons/fa';
import { getImageUrl } from '../utils/imageUtils';

const CategoryCard = ({ category }) => {
    // Function to get category icon
    const getCategoryIcon = (categoryName) => {
        if (!categoryName) return '📦';
        
        const name = categoryName.toLowerCase();
        if (name.includes('toy') || name.includes('plush') || name.includes('stuffed')) {
            return '🧸';
        } else if (name.includes('stationery') || name.includes('book') || name.includes('pen')) {
            return '📚';
        } else if (name.includes('accessory') || name.includes('jewelry') || name.includes('bag')) {
            return '💎';
        } else if (name.includes('home') || name.includes('decor') || name.includes('living')) {
            return '🏠';
        } else if (name.includes('cloth') || name.includes('wear') || name.includes('fashion')) {
            return '👗';
        } else if (name.includes('beauty') || name.includes('makeup') || name.includes('skin')) {
            return '💄';
        } else if (name.includes('electronic') || name.includes('tech') || name.includes('gadget')) {
            return '📱';
        } else if (name.includes('sports') || name.includes('fitness') || name.includes('gym')) {
            return '🏃‍♀️';
        } else if (name.includes('food') || name.includes('snack') || name.includes('drink')) {
            return '🍔';
        }
        return '🎁';
    };

    // Function to get category gradient
    const getCategoryGradient = (index) => {
        const gradients = [
            'from-pink-400 via-rose-400 to-red-400',
            'from-purple-400 via-violet-400 to-indigo-400',
            'from-blue-400 via-cyan-400 to-teal-400',
            'from-emerald-400 via-green-400 to-lime-400',
            'from-yellow-400 via-amber-400 to-orange-400',
            'from-fuchsia-400 via-pink-400 to-rose-400',
            'from-cyan-400 via-sky-400 to-blue-400',
            'from-green-400 via-emerald-400 to-teal-400'
        ];
        return gradients[index % gradients.length];
    };

    // Determine image source
    const imageSrc = getImageUrl(category.image);
    const categoryIcon = category.icon || getCategoryIcon(category.name);
    const gradientClass = getCategoryGradient(category.index || 0);

    return (
        <Link
            to={`/categories/${category.slug}`}
            className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 h-80 flex flex-col"
        >
            {/* Image Container */}
            <div className="relative h-3/4 overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50 flex-1">
                {/* Fallback gradient if image fails */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-20`}></div>
                
                {/* Category Image */}
                <img
                    src={imageSrc}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                        console.log('Image failed to load:', imageSrc);
                        // Hide the broken image and show icon instead
                        e.target.style.display = 'none';
                        
                        // Find or create the fallback container
                        let fallbackDiv = e.target.parentNode.querySelector('.image-fallback');
                        if (!fallbackDiv) {
                            fallbackDiv = document.createElement('div');
                            fallbackDiv.className = 'image-fallback absolute inset-0 flex items-center justify-center';
                            fallbackDiv.innerHTML = `<span class="text-6xl">${categoryIcon}</span>`;
                            e.target.parentNode.appendChild(fallbackDiv);
                        }
                    }}
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Icon Badge */}
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-3 border border-white/30">
                    <span className="text-2xl text-white">{categoryIcon}</span>
                </div>
                
                {/* Product Count Badge */}
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 border border-white/20">
                    <span className="text-white text-sm font-medium flex items-center">
                        <FaHeart className="mr-1 text-xs" /> {category.productCount || 0} items
                    </span>
                </div>
                
                {/* Hover Overlay Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-2xl font-bold drop-shadow-lg">
                            {category.name}
                        </h3>
                    </div>
                    
                    {category.description && (
                        <p className="text-white/90 text-sm mb-4 line-clamp-2">
                            {category.description}
                        </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                        <span className="text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            Click to explore →
                        </span>
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 group-hover:bg-white/30 transition-colors">
                            <FaArrowRight className="text-white" />
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Bottom Info Section */}
            <div className="bg-gradient-to-r from-white to-pink-50 p-4 h-1/4 flex flex-col justify-center">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="font-bold text-gray-900 text-lg mb-1">{category.name}</h4>
                        <p className="text-gray-600 text-sm">
                            Browse {category.productCount || 0} products
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-pink-600 font-bold text-sm mb-1">
                            Shop Now
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white">
                            <FaArrowRight className="text-xs" />
                        </div>
                    </div>
                </div>
                
                {/* Category Tags */}
                {category.tags && category.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                        {category.tags.slice(0, 2).map((tag, index) => (
                            <span
                                key={index}
                                className="inline-block bg-pink-100 text-pink-600 text-xs px-2 py-1 rounded-full"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
            
            {/* Hover Effect Border */}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-pink-300 rounded-2xl transition-colors duration-300 pointer-events-none"></div>
        </Link>
    );
};

export default CategoryCard;