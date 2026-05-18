import { FaCheck, FaUsers, FaAward, FaShippingFast, FaHeadset, FaHeart, FaMagic, FaStar, FaGift, FaSmile, FaMapMarkerAlt } from 'react-icons/fa'
import { GiCottonFlower } from 'react-icons/gi'
import storyImg from '../assets/WhatsApp Image 2026-05-16 at 8.13.55 PM.jpeg'

const About = () => {
  const values = [
    {
      icon: <FaCheck className="text-4xl" />,
      title: 'VFX Creativity ✨',
      description: 'Bringing artistic vision and creative magic to every part of Shazyboo.',
      color: 'from-pink-400 to-rose-400',
      bgColor: 'bg-pink-50'
    },
    {
      icon: <FaHeart className="text-4xl" />,
      title: 'Psychology of Joy 💖',
      description: 'Understanding the little things that bring genuine happiness to your heart.',
      color: 'from-purple-400 to-indigo-400',
      bgColor: 'bg-purple-50'
    },
    {
      icon: <FaMagic className="text-4xl" />,
      title: 'Kawaii Aesthetic 🎀',
      description: 'A shared passion for cute collections and cozy vibes in every treasure.',
      color: 'from-blue-400 to-cyan-400',
      bgColor: 'bg-blue-50'
    },
    {
      icon: <FaSmile className="text-4xl" />,
      title: 'Meaningful Smiles 😊',
      description: 'Spreading joy and comfort through carefully chosen adorable items.',
      color: 'from-green-400 to-emerald-400',
      bgColor: 'bg-green-50'
    }
  ]

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero */}
      <section className="relative py-16 sm:py-24 overflow-hidden" style={{ background: 'linear-gradient(135deg, #ef63a4 0%, #f585b9 0%, #e4f1f6 100%)' }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-pink-300/20 -translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-blue-300/20 translate-x-48 translate-y-48"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10 max-w-7xl">
          <div className="inline-flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
            <span className="text-white font-medium text-sm sm:text-base tracking-wide uppercase">Our Story</span>
          </div>
          
          <h1 className="fredoka text-4xl sm:text-5xl md:text-7xl text-white mb-6 leading-tight">
            Our Journey ✨
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto leading-relaxed font-medium">
            Three years ago, we just sat together and talked about a little dream called Shazyboo ✨🎀
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-white/90">
            <div className="flex items-center gap-2">
              <FaHeart className="text-yellow-300" />
              <span className="font-semibold">May 1, 2025</span>
            </div>
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-pink-200" />
              <span className="font-semibold">Kakkad, Malappuram</span>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0H1440V120C1440 120 1152 60 720 60C288 60 0 120 0 120V0Z" fill="var(--kiddex-bg)"/>
          </svg>
        </div>
      </section>

      {/* Story */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center justify-center bg-gradient-to-r from-pink-50 to-purple-50 rounded-full px-6 py-2 mb-8 shadow-sm border border-pink-100">
                <h2 className="fredoka text-2xl sm:text-3xl text-pink-600">
                  Where Dreams Come True
                </h2>
              </div>
              
              <div className="space-y-6 text-gray-600">
                <p className="text-base sm:text-lg leading-relaxed font-medium">
                  What once started as a simple conversation between us finally came true on May 1, 2025.
                </p>
                
                <p className="text-base sm:text-lg leading-relaxed">
                  Based in Kakkad, in the beautiful Malappuram district of Kerala, Shazyboo is more than just a small business to us — it’s a piece of our journey, passion, and imagination.
                </p>

                <p className="text-base sm:text-lg leading-relaxed">
                  Behind Shazyboo are a husband and wife duo: a <span className="font-bold text-pink-500">VFX artist</span> who loves bringing creative ideas to life, and an <span className="font-bold text-purple-500">MSc Psychology graduate</span> who believes in spreading happiness through little meaningful things.
                </p>
                
                <p className="text-base sm:text-lg leading-relaxed">
                  With our love for kawaii aesthetics, cute collections, and cozy vibes, we created Shazyboo to bring joy, comfort, and smiles to people through carefully chosen adorable treasures 💖🌸
                </p>

                <p className="text-base sm:text-lg leading-relaxed font-bold text-gray-800 italic">
                  Every order supports our dream, and we’re truly grateful to have you as part of our journey 🧸✨
                </p>
              </div>
            </div>
            
            <div className="relative mt-8 lg:mt-0 flex justify-center">
              <div className="relative w-full max-w-md">
                {/* Abstract Shape / Blob Background */}
                <div className="absolute inset-0 bg-gradient-to-tr from-pink-200 to-purple-200 rounded-[30%_70%_70%_30%/30%_30%_70%_70%] animate-pulse transform -rotate-6"></div>
                
                <div className="relative overflow-hidden shadow-2xl transition-all duration-500"
                  style={{ borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }}
                >
                  <img
                    src={storyImg}
                    alt="Our Magical Story"
                    className="w-full h-[350px] sm:h-[450px] object-cover hover:scale-110 transition-transform duration-700"
                  />
                </div>
                
                <div className="absolute -bottom-4 -right-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-pink-100 flex items-center gap-3">
                  <span className="text-3xl">🧸</span>
                  <div>
                    <div className="font-bold text-gray-800 text-sm">Founded with Love</div>
                    <div className="text-pink-500 text-xs font-bold">Malappuram, Kerala</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-pink-50/50 via-purple-50/50 to-blue-50/50 overflow-hidden">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center justify-center bg-white rounded-full px-4 sm:px-6 py-3 sm:py-4 shadow-lg mb-6">
              <FaHeart className="text-pink-500 mr-2 sm:mr-3 text-xl sm:text-2xl" />
              <h2 className="fredoka text-2xl sm:text-3xl md:text-4xl text-purple-600">
                Our Magical Values ✨
              </h2>
            </div>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              These values guide every magical decision we make and every adorable product we choose!
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {values.map((value, index) => (
              <div 
                key={index} 
                className={`relative group ${value.bgColor} p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 md:hover:-translate-y-3 border border-white`}
              >
                <div className="absolute -top-4 sm:-top-6 left-1/2 transform -translate-x-1/2">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${value.color} flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
                    {value.icon}
                  </div>
                </div>
                <div className="pt-10 sm:pt-12 text-center">
                  <h3 className="font-bold text-base sm:text-lg md:text-xl mb-2 sm:mb-3 md:mb-4 text-gray-800">{value.title}</h3>
                  <p className="text-gray-600 text-sm sm:text-base">{value.description}</p>
                </div>
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <FaMagic className="text-yellow-400 text-sm sm:text-base" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 text-white text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #ef63a4 0%, #f585b9 0%, #e4f1f6 100%)' }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-white/10 -translate-x-48 -translate-y-48"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white/10 translate-x-48 translate-y-48"></div>
        </div>
        
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full p-4 sm:p-6 mb-6 sm:mb-8">
            <FaHeadset className="text-white text-3xl sm:text-4xl md:text-5xl animate-pulse" />
          </div>
          
          <h2 className="fredoka text-2xl sm:text-3xl md:text-5xl text-white mb-4 sm:mb-6">
            Have Magical Questions? 🤔
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 md:mb-10 max-w-3xl mx-auto leading-relaxed">
            Our team is always here to help you with any questions or concerns, 
            ready to sprinkle some magic on your day! ✨
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 justify-center">
            <a 
              href="/contact" 
              className="group bg-white text-pink-600 hover:bg-pink-50 px-4 sm:px-6 md:px-10 py-3 sm:py-4 md:py-5 rounded-full font-bold text-base sm:text-lg md:text-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 sm:hover:-translate-y-2 transform hover:scale-105 flex items-center justify-center"
            >
              <span className="mr-2 sm:mr-3">Contact Our Team</span>
              <FaHeart className="text-sm sm:text-base group-hover:animate-pulse" />
            </a>
            
            <a 
              href="/shop" 
              className="group border-2 border-white text-white hover:bg-white/20 px-4 sm:px-6 md:px-10 py-3 sm:py-4 md:py-5 rounded-full font-bold text-base sm:text-lg md:text-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 sm:hover:-translate-y-2 backdrop-blur-sm flex items-center justify-center"
            >
              <span className="mr-2 sm:mr-3">Start Shopping</span>
              <FaMagic className="text-sm sm:text-base group-hover:animate-spin" />
            </a>
          </div>
          
          <div className="mt-8 sm:mt-12 md:mt-16 pt-6 sm:pt-8 border-t border-white/30">
            <p className="text-base sm:text-lg md:text-xl">
              <span className="font-bold">P.S.</span> Every interaction with us comes with extra love and magical sparkles! 💫
            </p>
            <div className="flex justify-center mt-3 sm:mt-4 md:mt-6 gap-1 sm:gap-2 md:gap-4">
              {[...Array(5)].map((_, i) => (
                <FaHeart key={i} className="text-pink-200 animate-pulse text-xs sm:text-sm md:text-base" style={{animationDelay: `${i * 200}ms`}} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About